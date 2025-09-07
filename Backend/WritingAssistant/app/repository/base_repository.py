from contextlib import AbstractContextManager
from typing import Any, Callable, Type, TypeVar, Sequence, Union


from sqlalchemy.orm.attributes import InstrumentedAttribute

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import DuplicatedError, NotFoundError
from app.model.base import Base
from app.util.query_builder import dict_to_sqlalchemy_filter_options  

T = TypeVar("T", bound=Base)


class BaseRepository:
    DEFAULT_PAGE: int = 1
    DEFAULT_PER_PAGE: int = 20
    DEFAULT_ORDERING: str = "-id"

    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]], model: Type[T]) -> None:
        self.session_factory = session_factory
        self.model = model

    def read_by_options(
        self, 
        schema: T, 
        eager: bool = False, 
        eagers: Sequence[Union[str, InstrumentedAttribute]] = ()
    ) -> dict:
        with self.session_factory() as session:
            schema_as_dict: dict = schema.dict(exclude_none=True)

            ordering: str = schema_as_dict.get("ordering", self.DEFAULT_ORDERING)
            order_query = (
                getattr(self.model, ordering[1:]).desc()
                if ordering.startswith("-")
                else getattr(self.model, ordering).asc()
            )
            page: int = schema_as_dict.get("page", self.DEFAULT_PAGE)
            per_page = schema_as_dict.get("per_page", self.DEFAULT_PER_PAGE)

            filter_options = dict_to_sqlalchemy_filter_options(
                self.model, schema.dict(exclude_none=True)
            )

            query = session.query(self.model)

            targets = list(eagers) or (getattr(self.model, "eagers", []) if eager else [])
            for target in targets:
                attr = target if not isinstance(target, str) else getattr(self.model, target)
                query = query.options(joinedload(attr))

            filtered_query = query.filter(filter_options)
            query = filtered_query.order_by(order_query)

            if per_page == "all":
                query = query.all()
            else:
                query = query.limit(per_page).offset((page - 1) * per_page).all()

            total_count = filtered_query.count()
            return {
                "founds": query,
                "search_options": {
                    "page": page,
                    "per_page": per_page,
                    "ordering": ordering,
                    "total_count": total_count,
                },
            }

    def read_by_id(
        self,
        id: int,
        eager: bool = False,
        eagers: Sequence[Union[str, InstrumentedAttribute]] = ()
    ):
        with self.session_factory() as session:
            query = session.query(self.model)
            targets = list(eagers) or (getattr(self.model, "eagers", []) if eager else [])
            for target in targets:
                attr = target if not isinstance(target, str) else getattr(self.model, target)
                query = query.options(joinedload(attr))

            
            if hasattr(self.model, "deleted"):
                query = query.filter(self.model.deleted == 0)

            obj = query.filter(self.model.id == id).first()
            if not obj:
                raise NotFoundError(detail=f"not found id : {id}")
            return obj

    def create(self, schema: T):
        with self.session_factory() as session:
            query = self.model(**schema.dict())
            try:
                session.add(query)
                session.commit()
                session.refresh(query)
            except IntegrityError as e:
                raise DuplicatedError(detail=str(e.orig))
            return query

    def update(self, id: int, schema: T):
        with self.session_factory() as session:
            session.query(self.model).filter(self.model.id == id).update(
                schema.dict(exclude_none=True)
            )
            session.commit()
            return self.read_by_id(id)

    def update_attr(self, id: int, column: str, value: Any):
        with self.session_factory() as session:
            session.query(self.model).filter(self.model.id == id).update({column: value})
            session.commit()
            return self.read_by_id(id)

    def whole_update(self, id: int, schema: T):
        with self.session_factory() as session:
            session.query(self.model).filter(self.model.id == id).update(schema.dict())
            session.commit()
            return self.read_by_id(id)
        
    def delete_by_id(self, id: int):
        with self.session_factory() as session:
            query = session.query(self.model).filter(self.model.id == id).first()
            if not query:
                raise NotFoundError(detail=f"not found id : {id}")

            if not hasattr(query, "deleted"):
                raise NotFoundError(detail="Not able to delete: model is missing 'deleted' field")

            setattr(query, "deleted", 1)
            session.add(query)
            session.commit()
            session.refresh(query)
            return query
        
    def close_scoped_session(self):
        with self.session_factory() as session:
            return session.close()
