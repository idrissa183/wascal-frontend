# =====================================================
# MÉTHODES À AJOUTER À VOTRE GeographicRepository
# Copier ces méthodes dans votre fichier repositories/geographic_repository.py
# =====================================================

def get_countries_with_search(self, skip: int = 0, limit: int = 100, search: str = None) -> List[Countries]:
    """Recherche étendue dans les pays avec tous les champs pertinents"""
    query = self.db.query(Countries)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Countries.shape_name.ilike(search_term)) |
            (Countries.shape_name_en.ilike(search_term)) |
            (Countries.shape_name_fr.ilike(search_term)) |
            (Countries.shape_iso.ilike(search_term)) |
            (Countries.shape_iso_2.ilike(search_term)) |
            (Countries.shape_city.ilike(search_term))  # Recherche par capitale
        )
    
    return query.offset(skip).limit(limit).all()

def get_regions_with_search(self, skip: int = 0, limit: int = 100, search: str = None) -> List[Regions]:
    """Recherche dans les régions avec jointure pour récupérer le nom du pays"""
    query = self.db.query(Regions).join(Countries)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Regions.shape_name.ilike(search_term)) |
            (Countries.shape_name.ilike(search_term))  # Recherche aussi dans le nom du pays
        )
    
    return query.offset(skip).limit(limit).all()

def get_regions_by_country_with_search(self, country_id: int, search: str = None, skip: int = 0, limit: int = 100) -> List[Regions]:
    """Recherche des régions d'un pays spécifique"""
    query = self.db.query(Regions).filter(Regions.country_id == country_id)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(Regions.shape_name.ilike(search_term))
    
    return query.offset(skip).limit(limit).all()

def get_provinces_with_search(self, skip: int = 0, limit: int = 100, search: str = None) -> List[Provinces]:
    """Recherche dans les provinces avec jointure pour la hiérarchie"""
    query = self.db.query(Provinces).join(Regions).join(Countries)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Provinces.shape_name.ilike(search_term)) |
            (Regions.shape_name.ilike(search_term)) |
            (Countries.shape_name.ilike(search_term))
        )
    
    return query.offset(skip).limit(limit).all()

def get_provinces_by_region_with_search(self, region_id: int, search: str = None, skip: int = 0, limit: int = 100) -> List[Provinces]:
    """Recherche des provinces d'une région spécifique"""
    query = self.db.query(Provinces).filter(Provinces.region_id == region_id)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(Provinces.shape_name.ilike(search_term))
    
    return query.offset(skip).limit(limit).all()

def get_departments_with_search(self, skip: int = 0, limit: int = 100, search: str = None) -> List[Departments]:
    """Recherche dans les départements avec jointure pour la hiérarchie complète"""
    query = self.db.query(Departments).join(Provinces).join(Regions).join(Countries)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Departments.shape_name.ilike(search_term)) |
            (Provinces.shape_name.ilike(search_term)) |
            (Regions.shape_name.ilike(search_term)) |
            (Countries.shape_name.ilike(search_term))
        )
    
    return query.offset(skip).limit(limit).all()

def get_departments_by_province_with_search(self, province_id: int, search: str = None, skip: int = 0, limit: int = 100) -> List[Departments]:
    """Recherche des départements d'une province spécifique"""
    query = self.db.query(Departments).filter(Departments.province_id == province_id)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(Departments.shape_name.ilike(search_term))
    
    return query.offset(skip).limit(limit).all()

# =====================================================
# MÉTHODES À MODIFIER DANS VOS SCHEMAS (schemas.py)
# Pour enrichir les réponses avec les informations hiérarchiques
# =====================================================

# Dans RegionResponse, ajouter :
# country_name: Optional[str] = None

# Dans ProvinceResponse, ajouter :
# region_name: Optional[str] = None
# country_name: Optional[str] = None

# Dans DepartmentResponse, ajouter :
# province_name: Optional[str] = None
# region_name: Optional[str] = None
# country_name: Optional[str] = None

# =====================================================
# EXEMPLE D'IMPLÉMENTATION AVEC SQLALCHEMY POUR ENRICHIR LES DONNÉES
# =====================================================

def get_regions_with_country_info(self, skip: int = 0, limit: int = 100, search: str = None) -> List[Dict]:
    """Version avancée qui retourne les régions avec le nom du pays"""
    query = self.db.query(
        Regions.id,
        Regions.shape_name,
        Regions.country_id,
        Regions.shape_iso,
        Regions.shape_area_km2,
        Regions.shape_people,
        Regions.created_at,
        Regions.updated_at,
        Regions.geometry,
        Countries.shape_name.label('country_name')
    ).join(Countries, Regions.country_id == Countries.id)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Regions.shape_name.ilike(search_term)) |
            (Countries.shape_name.ilike(search_term))
        )
    
    results = query.offset(skip).limit(limit).all()
    
    # Convertir en dictionnaires pour faciliter la sérialisation
    return [
        {
            'id': result.id,
            'shape_name': result.shape_name,
            'country_id': result.country_id,
            'shape_iso': result.shape_iso,
            'shape_area_km2': result.shape_area_km2,
            'shape_people': result.shape_people,
            'created_at': result.created_at,
            'updated_at': result.updated_at,
            'geometry': result.geometry,
            'country_name': result.country_name
        }
        for result in results
    ]