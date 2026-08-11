const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados FixCar...');

  // 1. Criar Usuários
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashGestor = await bcrypt.hash('gestor123', 10);
  const passwordHashInspetor = await bcrypt.hash('inspetor123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fixcar.com' },
    update: {},
    create: {
      name: 'Carlos Administrador',
      email: 'admin@fixcar.com',
      password_hash: passwordHashAdmin,
      role: 'ADMIN',
      active: true,
    },
  });

  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@fixcar.com' },
    update: {},
    create: {
      name: 'Mariana Gestora',
      email: 'gestor@fixcar.com',
      password_hash: passwordHashGestor,
      role: 'GESTOR',
      active: true,
    },
  });

  const inspetor = await prisma.user.upsert({
    where: { email: 'inspetor@fixcar.com' },
    update: {},
    create: {
      name: 'Roberto Vistoriador',
      email: 'inspetor@fixcar.com',
      password_hash: passwordHashInspetor,
      role: 'INSPETOR',
      active: true,
    },
  });

  console.log('✅ Usuários criados com sucesso:');
  console.log('   - Admin:    admin@fixcar.com / admin123');
  console.log('   - Gestor:   gestor@fixcar.com / gestor123');
  console.log('   - Inspetor: inspetor@fixcar.com / inspetor123');

  // 2. Criar Clientes
  const cliente1 = await prisma.client.create({
    data: {
      name: 'Lucas Ferreira da Silva',
      phone: '(11) 98765-4321',
      email: 'lucas.silva@email.com',
      document: '123.456.789-00',
    },
  });

  const cliente2 = await prisma.client.create({
    data: {
      name: 'Beatriz Costa Mendes',
      phone: '(11) 91234-5678',
      email: 'beatriz.mendes@email.com',
      document: '987.654.321-99',
    },
  });

  // 3. Criar Veículos
  const veiculo1 = await prisma.vehicle.create({
    data: {
      client_id: cliente1.id,
      plate: 'ABC-1D23',
      model: 'Corolla XEi 2.0',
      brand: 'Toyota',
      year_model: '2022/2023',
      color: 'Prata',
      km: 34500,
      chassis: '9BRBL48E8P8123456',
      renavam: '00123456789',
      fuel_type: 'Flex',
    },
  });

  const veiculo2 = await prisma.vehicle.create({
    data: {
      client_id: cliente2.id,
      plate: 'XYZ-9E87',
      model: 'Compass Longitude T270',
      brand: 'Jeep',
      year_model: '2023/2024',
      color: 'Preto',
      km: 18200,
      chassis: '988BB58E8P8987654',
      renavam: '00987654321',
      fuel_type: 'Flex',
    },
  });

  // 4. Criar Templates do Checklist Oficial
  const checklistItems = [
    // INTERNO
    { category: 'INTERNO', name: 'Rádio / CD / DVD', order: 1 },
    { category: 'INTERNO', name: 'Extintor', order: 2 },
    { category: 'INTERNO', name: 'Tapetes', order: 3 },
    { category: 'INTERNO', name: 'Bancos', order: 4 },
    { category: 'INTERNO', name: 'Painel Interno', order: 5 },
    { category: 'INTERNO', name: 'Ar-condicionado', order: 6 },
    { category: 'INTERNO', name: 'Retrovisor Interno', order: 7 },
    { category: 'INTERNO', name: 'Para-sol', order: 8 },

    // FRENTE E LATERAIS
    { category: 'FRENTE_LATERAIS', name: 'Capô', order: 9 },
    { category: 'FRENTE_LATERAIS', name: 'Protetor de Cárter', order: 10 },
    { category: 'FRENTE_LATERAIS', name: 'Para-brisa', order: 11 },
    { category: 'FRENTE_LATERAIS', name: 'Palhetas Dianteiras', order: 12 },
    { category: 'FRENTE_LATERAIS', name: 'Antena', order: 13 },
    { category: 'FRENTE_LATERAIS', name: 'Faróis Dianteiros', order: 14 },
    { category: 'FRENTE_LATERAIS', name: 'Faróis de Neblina', order: 15 },
    { category: 'FRENTE_LATERAIS', name: 'Pisca-alertas', order: 16 },
    { category: 'FRENTE_LATERAIS', name: 'Tampa de Combustível', order: 17 },

    // TRASEIRA
    { category: 'TRASEIRA', name: 'Estepe', order: 18 },
    { category: 'TRASEIRA', name: 'Macaco', order: 19 },
    { category: 'TRASEIRA', name: 'Triângulo', order: 20 },
    { category: 'TRASEIRA', name: 'Chave de Roda', order: 21 },
    { category: 'TRASEIRA', name: 'Para-brisa (Vigia)', order: 22 },
    { category: 'TRASEIRA', name: 'Palheta Traseira', order: 23 },
    { category: 'TRASEIRA', name: 'Faróis Internos / Lanternas', order: 24 },
    { category: 'TRASEIRA', name: 'Pisca-alertas', order: 25 },
    { category: 'TRASEIRA', name: 'Sensor Estacionamento', order: 26 },
    { category: 'TRASEIRA', name: 'Ponteira Escapamento', order: 27 },

    // TAMPAS INTERNAS, ÓLEOS, FILTROS e OUTROS
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Partida a Frio', order: 28 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Limpador de Para-brisa (Reservatório)', order: 29 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Óleo do Motor', order: 30 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Radiador / Arrefecimento', order: 31 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Fluido de Freios', order: 32 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Filtro de Ar-condicionado', order: 33 },
    { category: 'TAMPAS_FLUIDOS_OUTROS', name: 'Bateria', order: 34 },

    // ESTÁTICO
    { category: 'ESTATICO', name: 'Pressão de Pneus/Estepes', order: 35 },
    { category: 'ESTATICO', name: 'Nível dos Fluidos', order: 36 },
    { category: 'ESTATICO', name: 'Lavadores Para-brisa', order: 37 },
    { category: 'ESTATICO', name: 'Faróis alto/baixo', order: 38 },
    { category: 'ESTATICO', name: 'Faróis de Neblina', order: 39 },
    { category: 'ESTATICO', name: 'Vidros/Espelhos', order: 40 },
    { category: 'ESTATICO', name: 'Alarme', order: 41 },
    { category: 'ESTATICO', name: 'Buzina', order: 42 },
    { category: 'ESTATICO', name: 'Sistema de Áudio/Relógio', order: 43 },
    { category: 'ESTATICO', name: 'Freio de Estacionamento', order: 44 },

    // RODAGEM
    { category: 'RODAGEM', name: 'Temperatura do Motor', order: 45 },
    { category: 'RODAGEM', name: 'Quadros de Instrumento', order: 46 },
    { category: 'RODAGEM', name: 'Marcha Lenta', order: 47 },
    { category: 'RODAGEM', name: 'Ar-condicionado', order: 48 },
    { category: 'RODAGEM', name: 'Motor', order: 49 },
    { category: 'RODAGEM', name: 'Transmissão', order: 50 },
    { category: 'RODAGEM', name: 'Alinhamento da Direção', order: 51 },
    { category: 'RODAGEM', name: 'Suspensão', order: 52 },
    { category: 'RODAGEM', name: 'Frenagem', order: 53 },
  ];

  for (const item of checklistItems) {
    await prisma.checklistItemTemplate.create({
      data: item,
    });
  }
  console.log(`✅ ${checklistItems.length} itens oficiais do checklist parametrizados.`);

  // 5. Criar uma Inspeção Demonstrativa Completa
  const inspection1 = await prisma.inspection.create({
    data: {
      os_number: 'OS-2026-0891',
      client_id: cliente1.id,
      vehicle_id: veiculo1.id,
      inspector_id: inspetor.id,
      consultant_name: 'Roberto Vistoriador',
      is_driver_the_scheduler: true,
      status: 'FINALIZADO',
      fuel_level: 0.75,
      battery_lev_percent: 85,
      test_drive_needed: false,
      protective_covers_placed: true,
      warranty_manual_requested: true,
      has_bed: false,
      has_marine_cover: false,
      belongings: JSON.stringify(['Óculos', 'Mochila', 'Carregador Celular']),
      bodywork_notes: 'Pequeno risco no para-choque traseiro lado direito e marcação de amassado na porta do passageiro.',
      tires_notes: 'Pneus em excelente estado, cerca de 70% de vida útil.',
      entry_signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      entry_date: '10/08/2026',
      entry_time: '09:30',
      terms_accepted: true,
    },
  });

  // Criar respostas da inspeção 1
  for (const item of checklistItems) {
    let status = 'S';
    let observation = null;
    if (item.name === 'Extintor') {
      status = 'N';
      observation = 'Item opcional conforme resolução Contran';
    } else if (item.name === 'Palhetas Dianteiras') {
      status = 'A';
      observation = 'Borracha ressecada';
    }

    await prisma.inspectionAnswer.create({
      data: {
        inspection_id: inspection1.id,
        category: item.category,
        item_name: item.name,
        status: status,
        observation: observation,
      },
    });
  }

  // Criar Condições de Pneus e Rodas
  const positions = ['DIANTEIRO_D', 'DIANTEIRO_E', 'TRASEIRO_D', 'TRASEIRO_E'];
  for (const pos of positions) {
    await prisma.tireWheelStatus.create({
      data: {
        inspection_id: inspection1.id,
        position: pos,
        type: 'PNEU',
        status: 'OK',
        notes: 'Calibragem 32 PSI',
      },
    });
    await prisma.tireWheelStatus.create({
      data: {
        inspection_id: inspection1.id,
        position: pos,
        type: 'RODA_LIGA_LEVE',
        status: pos === 'TRASEIRO_D' ? 'AVARIADO' : 'OK',
        notes: pos === 'TRASEIRO_D' ? 'Pequeno arranhão na borda da roda' : 'Sem avarias',
      },
    });
  }

  // Criar Marcações de Blueprint
  await prisma.damageMarking.createMany({
    data: [
      {
        inspection_id: inspection1.id,
        view_type: 'LATERAL_DIREITA',
        damage_type: 'A', // Amassado
        coord_x: 45.5,
        coord_y: 62.0,
        notes: 'Amassado leve na porta do passageiro dianteiro',
      },
      {
        inspection_id: inspection1.id,
        view_type: 'TRASEIRA',
        damage_type: 'R', // Riscado
        coord_x: 75.0,
        coord_y: 80.0,
        notes: 'Risco de 5cm no para-choque traseiro',
      },
      {
        inspection_id: inspection1.id,
        view_type: 'FRONTAL',
        damage_type: 'R', // Riscado
        coord_x: 30.0,
        coord_y: 88.0,
        notes: 'Pequena marca de pedra no spoiler dianteiro',
      },
    ],
  });

  console.log('✅ Inspeção demonstrativa (OS-2026-0891) cadastrada com sucesso.');
  console.log('🎉 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
