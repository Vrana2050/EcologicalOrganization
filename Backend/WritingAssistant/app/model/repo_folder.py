from __future__ import annotations
import datetime
from typing import Optional, List
from sqlalchemy import BigInteger, Integer, VARCHAR, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

class RepoFolder(Base):
    __tablename__ = "repo_folder"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("repo_folder.id"))
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(True), server_default=text("CURRENT_TIMESTAMP"))
    deleted: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0 "))

    parent: Mapped["RepoFolder"] = relationship("RepoFolder", remote_side=[id], backref="children")
