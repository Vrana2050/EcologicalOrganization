from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Any
from datetime import datetime, date, time
from decimal import Decimal


class MetadataAppliesTo(str, Enum):
    DIRECTORY = "DIRECTORY"
    DOCUMENT = "DOCUMENT"
    BOTH = "BOTH"


class MetadataType(str, Enum):
    STRING = "String"
    BOOLEAN = "Boolean"
    DATE = "Date"
    DATETIME = "Datetime"
    TIME = "Time"
    INTEGER = "Integer"
    DECIMAL = "Decimal"



@dataclass
class CustomMetadataRule:
    id: int
    custom_metadata_id: int
    directory_id: int
    applies_to: MetadataAppliesTo
    is_required: Optional[bool] = False
    is_recursive: Optional[bool] = False

    custom_metadata: Optional["CustomMetadata"] = None



@dataclass
class CustomMetadata:
    name: str
    metadata_type: MetadataType
    description: Optional[str] = None
    id: Optional[int] = None

    def validate_value(self, value: Any) -> str | None:
        """
        Proverava da li je value validan u zavisnosti od metadata_type.
        Ako jeste, vraća ga u string formatu.
        """
        if value is None:
            return None

        if self.metadata_type == MetadataType.STRING:
            if not isinstance(value, str):
                raise ValueError(f"Metadata {self.name} mora biti string")
            value = value.strip()
            return value if value else None

        elif self.metadata_type == MetadataType.BOOLEAN:
            if isinstance(value, bool):
                return "true" if value else "false"
            if str(value).lower() in ["true", "1"]:
                return "true"
            if str(value).lower() in ["false", "0"]:
                return "false"
            raise ValueError(f"Metadata {self.name} mora biti boolean")

        elif self.metadata_type == MetadataType.INTEGER:
            try:
                return str(int(value))
            except (ValueError, TypeError):
                raise ValueError(f"Metadata {self.name} mora biti integer")

        elif self.metadata_type == MetadataType.DECIMAL:
            try:
                return str(Decimal(value))
            except (ValueError, TypeError, ArithmeticError):
                raise ValueError(f"Metadata {self.name} mora biti decimal")

        elif self.metadata_type == MetadataType.DATE:
            try:
                if isinstance(value, date) and not isinstance(value, datetime):
                    return value.isoformat()
                return datetime.fromisoformat(str(value)).date().isoformat()
            except Exception:
                raise ValueError(f"Metadata {self.name} mora biti validan datum (YYYY-MM-DD)")

        elif self.metadata_type == MetadataType.DATETIME:
            try:
                if isinstance(value, datetime):
                    return value.isoformat()
                return datetime.fromisoformat(str(value)).isoformat()
            except Exception:
                raise ValueError(f"Metadata {self.name} mora biti validan datetime (YYYY-MM-DDTHH:MM:SS)")

        elif self.metadata_type == MetadataType.TIME:
            try:
                if isinstance(value, time):
                    return value.isoformat()
                return time.fromisoformat(str(value)).isoformat()
            except Exception:
                raise ValueError(f"Metadata {self.name} mora biti validno vreme (HH:MM[:SS])")

        else:
            raise ValueError(f"Nepoznat tip metadata: {self.metadata_type}")

@dataclass
class CustomMetadataValue:
    id: int
    document_id: Optional[int] = None
    directory_id: Optional[int] = None
    metadata_rule_id: Optional[int] = None
    value: Optional[str] = None
    is_missing_value: Optional[bool] = False
    custom_metadata: Optional[CustomMetadata] = None

    def get_typed_value(self):
        """
        Konvertuje self.value (string) nazad u odgovarajući tip,
        na osnovu metadata_type u self.custom_metadata.
        """
        if not self.custom_metadata or self.value is None:
            return self.value

        mtype = self.custom_metadata.metadata_type
        raw = self.value

        try:
            if mtype == MetadataType.STRING:
                return str(raw)

            elif mtype == MetadataType.BOOLEAN:
                return raw.lower() in ["true", "1"]

            elif mtype == MetadataType.INTEGER:
                return int(raw)

            elif mtype == MetadataType.DECIMAL:
                return Decimal(raw)

            elif mtype == MetadataType.DATE:
                return date.fromisoformat(raw)

            elif mtype == MetadataType.DATETIME:
                return datetime.fromisoformat(raw)

            elif mtype == MetadataType.TIME:
                return time.fromisoformat(raw)

            else:
                return raw
        except Exception:
            # Ako nešto pođe po zlu, vrati originalni string (fallback)
            return raw
