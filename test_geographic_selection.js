// Test script to simulate geographic selection issue
// This simulates what happens when a user clicks on a geographic entity in the sidebar

const API_BASE_URL = 'http://localhost:8000';

async function testGeographicSelection() {
  console.log('🧪 Testing Geographic Selection Flow...');
  
  // Test 1: Check if API is accessible
  console.log('\n📡 Step 1: Testing API connectivity...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/geographic/countries`);
    const countries = await response.json();
    console.log(`✅ API accessible, found ${countries.length} countries`);
    
    if (countries.length > 0) {
      const firstCountry = countries[0];
      console.log(`🏷️  First country: ${firstCountry.shape_name} (ID: ${firstCountry.id})`);
      
      // Test 2: Get specific country with geometry
      console.log('\n📍 Step 2: Testing geometry fetch...');
      const startTime = performance.now();
      const countryResponse = await fetch(`${API_BASE_URL}/api/v1/geographic/countries/${firstCountry.id}`);
      const countryData = await countryResponse.json();
      const endTime = performance.now();
      
      console.log(`⏱️  API call took ${Math.round(endTime - startTime)}ms`);
      console.log(`🗺️  Geometry type: ${countryData.geometry?.type}`);
      console.log(`📏 Coordinates length: ${countryData.geometry?.coordinates?.length}`);
      
      // Test 3: Validate geometry structure
      console.log('\n🔍 Step 3: Validating geometry structure...');
      if (!countryData.geometry) {
        console.error('❌ No geometry data found');
        return;
      }
      
      if (!countryData.geometry.type || !countryData.geometry.coordinates) {
        console.error('❌ Invalid geometry structure');
        console.error('Geometry:', countryData.geometry);
        return;
      }
      
      console.log('✅ Geometry structure is valid');
      
      // Test 4: Simulate OpenLayers processing
      console.log('\n🗺️ Step 4: Simulating OpenLayers geometry processing...');
      try {
        const geometryData = countryData.geometry;
        
        if (geometryData.type === 'MultiPolygon') {
          console.log('🔢 Processing MultiPolygon...');
          let totalRings = 0;
          let totalCoords = 0;
          
          geometryData.coordinates.forEach((polygonCoords, polygonIndex) => {
            console.log(`  Polygon ${polygonIndex + 1}: ${polygonCoords.length} rings`);
            totalRings += polygonCoords.length;
            
            polygonCoords.forEach((ring, ringIndex) => {
              console.log(`    Ring ${ringIndex + 1}: ${ring.length} coordinates`);
              totalCoords += ring.length;
            });
          });
          
          console.log(`📊 Total: ${geometryData.coordinates.length} polygons, ${totalRings} rings, ${totalCoords} coordinates`);
        } else if (geometryData.type === 'Polygon') {
          console.log('🔢 Processing Polygon...');
          console.log(`  ${geometryData.coordinates.length} rings`);
          geometryData.coordinates.forEach((ring, ringIndex) => {
            console.log(`    Ring ${ringIndex + 1}: ${ring.length} coordinates`);
          });
        }
        
        console.log('✅ Geometry processing simulation successful');
        
      } catch (error) {
        console.error('❌ Error in geometry processing simulation:', error);
      }
      
    }
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
  }
}

// Run the test
testGeographicSelection().then(() => {
  console.log('\n🏁 Test completed');
});