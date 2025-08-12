# Instructions de Débogage - Sélection Géographique

## Problème Rapporté
"Apparemment en sélectionnant une localité pour voir sa carte sur le map ça tourne indéfinimment mais au finish rien ne s'affiche or pourtant le test avec postman ne prend pas asser de temps pour récuperer les informations d'une localité avec le champ geometry."

## Solutions Implementées

### 1. Correction de la Gestion MultiPolygon
- **Problème**: OpenLayers MultiPolygon mal configuré
- **Solution**: Importation correcte et usage de `new MultiPolygon(polygons)` au lieu de `new Polygon(polygons.flat())`

### 2. Amélioration de la Gestion Asynchrone
- **Problème**: Gestion asynchrone défaillante dans `addSelection`
- **Solution**: Conversion en fonction async avec gestion d'erreurs appropriée

### 3. Debugging Complet
Ajout de logs détaillés à tous les niveaux:
- **Sidebar**: Lors de la sélection d'entités
- **Store**: Flux complet `addSelection` → `loadGeometry` → mise à jour état
- **MapContainer**: Processing des géométries et ajout aux couches

## Comment Tester

### Étape 1: Ouvrir la Console du Navigateur
1. Ouvrir Chrome/Firefox DevTools (F12)
2. Aller sur l'onglet "Console"
3. Vider la console (`Ctrl+L` ou clic droit → Clear)

### Étape 2: Naviguer vers la Carte
1. Aller sur `http://localhost:4321/map`
2. Attendre que la carte se charge complètement

### Étape 3: Tester la Sélection Géographique
1. Ouvrir le sidebar (panneau latéral gauche)
2. Développer le filtre "Geographic Regions"
3. **Sélectionner un pays** (ex: Côte d'Ivoire)
4. **Observer les logs dans la console**

### Étape 4: Analyser les Logs

#### Logs Attendus (Flux Normal):
```
🎯 addSelection called for country 1
✅ Adding entity to store: {id: "1", type: "country", name: "Côte d'Ivoire", isLoading: true}
🚀 Starting loadGeometry for country 1
🚀 STARTING loadGeometry for country 1
🔄 Loading geometry for country 1...
🔧 Geographic service: [object Object]
🌐 API base URL: http://localhost:8000/api/v1/geographic
📡 Calling API: getCountry(1)
📍 Full URL would be: /api/v1/geographic/countries/1
🌐 Making request to: http://localhost:8000/api/v1/geographic/countries/1
⏱️ Request to http://localhost:8000/api/v1/geographic/countries/1 took XXXms
📡 Response status: 200 OK
📦 Response data: {id: 1, shape_name: "Côte d'Ivoire", geometry: {...}}
⏱️ API call took XXXms
📦 Full response for country 1: {id: 1, shape_name: "Côte d'Ivoire", geometry: {...}}
🗺️ Geometry data: {type: "MultiPolygon", coordinates: [...]}
🔍 Geometry type: MultiPolygon
📏 Geometry coordinates length: 2
✅ Successfully loaded geometry for country 1
🎯 About to update entity state in store
🏁 FINISHED loadGeometry for country 1 - SUCCESS
🔚 CLEANUP: Set isLoadingGeometry to false for country 1
🗺️ Processing geometry for country 1: {type: "MultiPolygon", coordinates: [...]}
✅ Successfully added feature to map for country 1
```

#### Points de Défaillance Possibles:

1. **Erreur de Connectivité API**:
   ```
   ❌ HTTP Error Response: ...
   ❌ Request failed to http://localhost:8000/...
   ```

2. **Erreur de Géométrie**:
   ```
   ⚠️ No geometry data in response for country Côte d'Ivoire
   ⚠️ Invalid geometry structure for country Côte d'Ivoire
   ```

3. **Erreur OpenLayers**:
   ```
   ❌ Error adding feature for country 1
   📍 Geometry data: {...}
   ```

4. **Blocage Asynchrone**:
   - Logs s'arrêtent après "🚀 Starting loadGeometry"
   - Pas de logs "🏁 FINISHED"

## Solutions par Type d'Erreur

### Si Erreur de Connectivité:
1. Vérifier que le backend tourne: `lsof -i :8000`
2. Tester l'API manuellement: `curl http://localhost:8000/api/v1/geographic/countries/1`
3. Vérifier la variable d'environnement `VITE_API_BASE_URL`

### Si Erreur de Géométrie:
1. Examiner la structure de la géométrie retournée
2. Vérifier la sérialisation PostGIS → GeoJSON
3. Confirmer le format des coordonnées

### Si Erreur OpenLayers:
1. Vérifier la transformation des coordonnées `fromLonLat()`
2. Tester avec géométrie plus simple (Point)
3. Examiner les logs détaillés de processing

### Si Blocage Asynchrone:
1. Rechercher des erreurs JavaScript non capturées
2. Vérifier les promesses non résolues
3. Examiner l'état des stores Zustand

## Informations de Débogage Utiles

### Commandes Backend Utiles:
```bash
# Vérifier si le backend tourne
lsof -i :8000

# Tester l'API directement
curl "http://localhost:8000/api/v1/geographic/countries" | jq .
curl "http://localhost:8000/api/v1/geographic/countries/1" | jq .geometry

# Vérifier les logs du backend
# (regarder les logs dans le terminal où le backend tourne)
```

### Variables d'Environnement:
```bash
# Vérifier la configuration
cat .env | grep VITE_API_BASE_URL
```

### État des Stores:
Dans la console du navigateur:
```javascript
// Examiner l'état du store géographique
console.log('Geographic Store State:', useGeographicStore.getState());
```

## Résolution Finale

Une fois les logs obtenus, analyser le point exact où le flux s'arrête et appliquer la solution correspondante. Le système de debugging complet devrait permettre d'identifier précisément le problème.