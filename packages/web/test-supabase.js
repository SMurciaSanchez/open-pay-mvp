// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

// Usa tus credenciales reales de Supabase
const supabaseUrl = 'https://garzwhnenhtmpfvfntmk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhcnp3aG5lbmh0bXBmdmZudG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjMyMjIsImV4cCI6MjA1Nzc5OTIyMn0.eyjfb2Np7J0csyorPgKZx5O6Ns598j1miUxS1RjDuac'; // Usa la clave anon_key (NO la service_role)

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Probar autenticación
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Estado de sesión:', authData ? 'Hay una sesión activa' : 'No hay sesión activa');
    
    if (authError) {
      console.error('Error de autenticación:', authError.message);
    }
    
    // Intentar crear un usuario de prueba (opcional)
    /*
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'prueba@ejemplo.com',
      password: 'contraseña-segura',
    });
    
    if (userError) {
      console.error('Error al crear usuario:', userError.message);
    } else if (userData) {
      console.log('Usuario creado exitosamente:', userData.user.id);
    }
    */
    
    // Añade esto antes de la consulta a profiles
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'sebasms777@gmail.com',
      password: 'nico8983'  // Reemplaza esto con tu contraseña real
    });
    
    if (signInError) {
      console.error('Error al iniciar sesión:', signInError.message);
    } else {
      console.log('✅ Inicio de sesión exitoso:', signInData.user?.id);
    }
    
    // Probar acceso a tablas
    console.log('\nProbando acceso a la tabla "profiles"...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('Error al acceder a profiles:', profilesError.message);
      if (profilesError.message.includes('does not exist')) {
        console.log('⚠️ La tabla "profiles" no existe. Debes ejecutar los scripts SQL primero.');
      }
    } else {
      console.log('✅ Conexión exitosa a la tabla "profiles"');
      console.log(`Registros encontrados: ${profilesData.length}`);
      if (profilesData.length > 0) {
        console.log('Primer registro:', profilesData[0]);
      } else {
        console.log('No hay registros en la tabla "profiles". Debes insertar datos de ejemplo.');
      }
    }
    
    // Verificar la versión y estado de Supabase
    console.log('\nInformación de conexión a Supabase:');
    console.log('URL:', supabaseUrl);
    console.log('Proyecto inicializado correctamente');
    
  } catch (error) {
    console.error('Error general de conexión:', error.message);
  }
}

testConnection(); 