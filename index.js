// archivo: index.js

import admin from 'firebase-admin';
import fetch from 'node-fetch';
import fs from 'fs';
import cron from 'node-cron';

// Cargar credenciales
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-adminsdk.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const DEVICE_TOKEN = 'eohI38IqQ9K7ngg5pI1JD_:APA91bG-UuaVCergH3cSCT03x1c_xRTQoVLS4wyQJZQo9ezC_WT2bb9e8FM_lyZgjBR0tZ5jSpii09FN4M4yXDt868pf7wNXkuOZZADW4xkCwNvZIwRuJ6M';
const API_FOOTBALL_KEY = 'd211fdfd8b1c4743f8aaed08e9622cb9';

async function verificarPartidos() {
  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });

    const data = await res.json();
    const partidos = data.response || [];

    for (const p of partidos) {
      if (p.fixture.status.short === 'P') {
        const title = '¡Definición por penales!';
        const body = `${p.teams.home.name} vs ${p.teams.away.name}`;

        await admin.messaging().send({
          notification: { title, body },
          token: DEVICE_TOKEN,
        });

        console.log('✅ Notificación enviada:', body);
      }
    }
  } catch (error) {
    console.error('❌ Error al verificar partidos:', error);
  }
}

// Ejecutar cada 5 minutos
cron.schedule('*/5 * * * *', () => {
  console.log('🔄 Verificando partidos...');
  verificarPartidos();
});
