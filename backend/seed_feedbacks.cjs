const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://elite_use:elite_pass@localhost:5432/desing_elite'
});

async function run() {
  await client.connect();

  const tablesRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
  const usersTable = tablesRes.rows.find(r => r.table_name === 'user' || r.table_name === 'users').table_name;
  const feedbackTable = tablesRes.rows.find(r => r.table_name === 'feedback' || r.table_name === 'feedbacks').table_name;

  const users = [
    { discord_id: '11111111111', username: 'obyto_444', avatar: 'https://i.pravatar.cc/150?u=1' },
    { discord_id: '22222222222', username: 'pinkfloydsom', avatar: 'https://i.pravatar.cc/150?u=2' },
    { discord_id: '33333333333', username: 'nb.x.', avatar: 'https://i.pravatar.cc/150?u=3' },
    { discord_id: '44444444444', username: 'jean_oficiall', avatar: 'https://i.pravatar.cc/150?u=4' },
    { discord_id: '55555555555', username: 'menO_rlk.bsb', avatar: 'https://i.pravatar.cc/150?u=5' },
    { discord_id: '66666666666', username: 'felps.ggg', avatar: 'https://i.pravatar.cc/150?u=6' },
  ];

  const insertedUsers = [];

  for (const u of users) {
    try {
      const res = await client.query(
        `INSERT INTO "${usersTable}" ("discord_id", username, avatar, email) VALUES ($1, $2, $3, $4) ON CONFLICT ("discord_id") DO UPDATE SET username = EXCLUDED.username RETURNING id`,
        [u.discord_id, u.username, u.avatar, `${u.username}@test.com`]
      );
      insertedUsers.push({ id: res.rows[0]?.id, username: u.username });
    } catch(e) {
      console.log('User insert err:', e.message);
    }
  }

  const feedbacks = [
    { username: 'obyto_444', comment: 'La mejor tienda', rating: 5 },
    { username: 'pinkfloydsom', comment: 'Simplemente la mejor, la atención y los recursos son nota 10/10', rating: 5 },
    { username: 'nb.x.', comment: 'La mejor tienda de scripts de la actualidad, la atención siempre top... compren en Diseño Elite chicos.', rating: 5 },
    { username: 'jean_oficiall', comment: '¡¡¡Muy buenos sistemas!!!', rating: 5 },
    { username: 'menO_rlk.bsb', comment: '10/1000 muy bueno y confiable', rating: 5 },
    { username: 'felps.ggg', comment: 'Muy bueno y rápido, todos los mods de aquí son los mejores, vale la pena la compra.', rating: 5 }
  ];

  const fbCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${feedbackTable}'`);
  const colNames = fbCols.rows.map(r => r.column_name);

  const userIdCol = colNames.includes('userId') ? 'userId' : 'user_id';
  const approvedCol = colNames.includes('isApproved') ? 'isApproved' : (colNames.includes('is_approved') ? 'is_approved' : (colNames.includes('approved') ? 'approved' : null));

  for (const f of feedbacks) {
    const user = insertedUsers.find(u => u.username === f.username);
    if (!user) {
      console.log('Skipped feedback because user missing for', f.username);
      continue;
    }

    try {
      if (approvedCol) {
        await client.query(
          `INSERT INTO "${feedbackTable}" ("${userIdCol}", comment, rating, "${approvedCol}") VALUES ($1, $2, $3, true)`,
          [user.id, f.comment, f.rating]
        );
      } else {
        await client.query(
          `INSERT INTO "${feedbackTable}" ("${userIdCol}", comment, rating) VALUES ($1, $2, $3)`,
          [user.id, f.comment, f.rating]
        );
      }
    } catch(e) {
      console.log('Feedback insert err:', e.message);
    }
  }

  console.log('Seeding complete. Inserted users:', insertedUsers.length);
  await client.end();
}

run().catch(console.error);
