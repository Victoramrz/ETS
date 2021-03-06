from typing import Any

from django.contrib.gis.gdal.base import GDALBase as GDALBase

class Feature(GDALBase):
    destructor: Any = ...
    ptr: Any = ...
    def __init__(self, feat: Any, layer: Any) -> None: ...
    def __getitem__(self, index: Any): ...
    def __len__(self): ...
    def __eq__(self, other: Any) -> Any: ...
    @property
    def encoding(self): ...
    @property
    def fid(self): ...
    @property
    def layer_name(self): ...
    @property
    def num_fields(self): ...
    @property
    def fields(self): ...
    @property
    def geom(self): ...
    @property
    def geom_type(self): ...
    def get(self, field: Any): ...
    def index(self, field_name: Any): ...
