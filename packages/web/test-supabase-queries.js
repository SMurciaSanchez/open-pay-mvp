const { createClient } = require('@supabase/supabase-js');

// Usa tus credenciales reales de Supabase
const supabaseUrl = 'https://garzwhnenhtmpfvfntmk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhcnp3aG5lbmh0bXBmdmZudG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjMyMjIsImV4cCI6MjA1Nzc5OTIyMn0.eyjfb2Np7J0csyorPgKZx5O6Ns598j1miUxS1RjDuac'; // Usa la clave anon_key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  try {
    console.log('------------------------');
    console.log('PRUEBA DE CONSULTAS SUPABASE');
    console.log('------------------------\n');
    
    // Iniciar sesión
    console.log('Iniciando sesión...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'sebasms777@gmail.com',
      password: 'nico8983'  // Reemplaza con tu contraseña real
    });
    
    if (signInError) {
      throw new Error(`Error al iniciar sesión: ${signInError.message}`);
    }
    
    console.log(`✅ Sesión iniciada: ${signInData.user.id}\n`);
    
    // 1. Consultar perfil del usuario
    console.log('Consultando tu perfil...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', signInData.user.id)
      .single();
    
    if (profileError) {
      throw new Error(`Error al consultar perfil: ${profileError.message}`);
    }
    
    console.log('✅ Perfil encontrado:');
    console.log(JSON.stringify(profileData, null, 2));
    console.log('');
    
    // 2. Consultar cuentas del usuario
    console.log('Consultando tus cuentas...');
    const { data: accountsData, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('profile_id', profileData.id);
    
    if (accountsError) {
      throw new Error(`Error al consultar cuentas: ${accountsError.message}`);
    }
    
    console.log(`✅ ${accountsData.length} cuentas encontradas:`);
    accountsData.forEach(account => {
      console.log(`- ${account.type}: $${account.balance.toLocaleString()} (${account.number})`);
    });
    console.log('');
    
    // 3. Consultar transacciones
    console.log('Consultando tus transacciones...');
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*, sender:sender_id(full_name), receiver:receiver_id(full_name)')
      .or(`sender_id.eq.${profileData.id},receiver_id.eq.${profileData.id}`)
      .order('created_at', { ascending: false });
    
    if (transactionsError) {
      throw new Error(`Error al consultar transacciones: ${transactionsError.message}`);
    }
    
    console.log(`✅ ${transactionsData.length} transacciones encontradas:`);
    transactionsData.forEach(tx => {
      const direction = tx.sender_id === profileData.id ? 'ENVIADA' : 'RECIBIDA';
      const otherParty = tx.sender_id === profileData.id 
        ? (tx.receiver?.full_name || 'Cuenta propia')
        : (tx.sender?.full_name || 'Desconocido');
      console.log(`- ${direction}: $${tx.amount.toLocaleString()} - ${otherParty} - ${tx.description}`);
    });
    console.log('');
    
    // 4. Consultar pagos de servicios
    console.log('Consultando tus pagos de servicios...');
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('service_payments')
      .select('*')
      .eq('profile_id', profileData.id);
    
    if (paymentsError) {
      throw new Error(`Error al consultar pagos: ${paymentsError.message}`);
    }
    
    console.log(`✅ ${paymentsData.length} pagos de servicios encontrados:`);
    paymentsData.forEach(payment => {
      console.log(`- ${payment.service_type} (${payment.provider}): $${payment.amount.toLocaleString()} - Estado: ${payment.status}`);
    });
    console.log('');
    
    // 5. Consultar logs de auditoría
    console.log('Consultando logs de auditoría (solo accesibles por admin)...');
    const { data: logsData, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(5);
    
    if (logsError) {
      console.log(`ℹ️ No se pudieron recuperar logs de auditoría: ${logsError.message}`);
      console.log('Esto es normal si no tienes permisos de administrador\n');
    } else {
      console.log(`✅ ${logsData.length} logs de auditoría encontrados:`);
      logsData.forEach(log => {
        console.log(`- ${log.action} en ${log.resource}: ${log.details}`);
      });
      console.log('');
    }
    
    console.log('------------------------');
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('------------------------');
    
  } catch (error) {
    console.error('❌ ERROR EN LAS PRUEBAS:');
    console.error(error.message);
  } finally {
    // Cerrar sesión
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(`Error al cerrar sesión: ${error.message}`);
    } else {
      console.log('Sesión cerrada correctamente');
    }
  }
}

testQueries(); 