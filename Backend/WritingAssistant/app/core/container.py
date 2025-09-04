from dependency_injector import containers, providers

from app.core.database import Database



class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[

        ]
    )

    # Database singleton (uzima URL iz Database klase direktno)
    db = providers.Singleton(Database)

