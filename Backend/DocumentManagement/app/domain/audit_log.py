from dataclasses import dataclass
from enum import Enum
from typing import Optional


class AuditObjectType(str, Enum):
    FOLDER = "FOLDER"
    FILE = "FILE"
    TAG = "TAG"
    METADATA = "METADATA"
    GROUP = "GROUP"

@dataclass
class AuditLog:
    id: int
    user_email: str
    object_type: AuditObjectType
    object_name: str
    action: str
    user_id: Optional[int] = None
    object_id: Optional[int] = None


class FolderActions(str, Enum):
    CREATE = "Folder: Create"
    RENAME = "Folder: Rename"
    DOWNLOAD = "Folder: Download"
    CHANGE_COLUMNS = "Folder: Change columns"
    DELETE = "Folder: Delete"
    MOVE = "Folder: Move"
    RETENTION = "Folder: Retention"
    ADD_META = "Folder: Add meta"
    REMOVE_META = "Folder: Remove meta"
    CHANGE_META_REQUIREMENT = "Folder: Change meta requirement"
    CHANGE_META_RECURSIVENESS = "Folder: Change meta recursiveness"
    CREATE_NEW_FILE = "Folder: Create new file"
    DELETE_FILE = "Folder: Delete a file"
    RESTORE_FILE = "Folder: Restore a file"
    MOVE_FILE_AWAY = "Folder: Move a file away"
    MOVE_FILE_IN = "Folder: Move a file in"
    CREATE_NEW_FOLDER = "Folder: Create new folder"
    DELETE_FOLDER = "Folder: Delete a folder"
    MOVE_FOLDER_AWAY = "Folder: Move a folder away"
    MOVE_FOLDER_IN = "Folder: Move a folder in"


class FileActions(str, Enum):
    CREATE = "File: Create"
    DELETE = "File: Delete"
    RESTORE = "File: Restore"
    RENAME = "File: Rename"
    DOWNLOAD = "File: Download"
    LOCK = "File: Lock"
    UNLOCK = "File: Unlock"
    MOVE = "File: Move"
    ADD_VERSION = "File: Add a version"
    REMOVE_VERSION = "File: Remove a version"
    RESTORE_VERSION = "File: Restore a version"
    RETENTION_END = "File: Retention end"
    ADD_TAG = "File: Add a tag"
    REMOVE_TAG = "File: Remove a tag"
    ADD_META = "File: Add meta"
    REMOVE_META = "File: Remove meta"
    CHANGE_META_VALUE = "File: Change meta value"


class TagActions(str, Enum):
    CREATE = "Tag: Create"
    RENAME = "Tag: Rename"
    DELETE = "Tag: Delete"
    EDIT_DESCRIPTION = "Tag: Edit description"


class MetadataActions(str, Enum):
    CREATE = "Meta: Create"
    DELETE = "Meta: Delete"
    RENAME = "Meta: Rename"
    EDIT_DESCRIPTION = "Meta: Edit description"


class GroupActions(str, Enum):
    CREATE = "Group: Create"
    DELETE = "Group: Delete"
    RENAME = "Group: Rename"
    EDIT_DESCRIPTION = "Group: Edit description"
    ADD_USER = "Group: Add user"
    REMOVE_USER = "Group: Remove user"

