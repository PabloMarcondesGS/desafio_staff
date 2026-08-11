const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testando conexão e integridade do banco de dados...');
  try {
    const usersCount = await prisma.user.count();
    const clientsCount = await prisma.client.count();
    const vehiclesCount = await prisma.vehicle.count();
    const templateItemsCount = await prisma.checklistItemTemplate.count();
    const inspectionsCount = await prisma.inspection.count();
    const damagesCount = await prisma.damageMarking.count();

    console.log('\n📊 Estatísticas do Banco de Dados:');
    console.log(`- Usuários cadastrados: ${usersCount}`);
    console.log(`- Clientes cadastrados: ${clientsCount}`);
    console.log(`- Veículos cadastrados: ${vehiclesCount}`);
    console.log(`- Itens de Checklist cadastrados: ${templateItemsCount}`);
    console.log(`- Inspeções cadastradas: ${inspectionsCount}`);
    console.log(`- Avarias mapeadas no blueprint: ${damagesCount}`);

    const latestInspection = await prisma.inspection.findFirst({
      include: {
        client: true,
        vehicle: true,
        damage_markings: true,
        answers: true,
      },
    });

    if (latestInspection) {
      console.log('\n🚘 Última Inspeção Verificada:');
      console.log(`- O.S.: ${latestInspection.os_number}`);
      console.log(`- Cliente: ${latestInspection.client.name}`);
      console.log(`- Veículo: ${latestInspection.vehicle.model} (${latestInspection.vehicle.plate})`);
      console.log(`- Status: ${latestInspection.status}`);
      console.log(`- Total de itens checados: ${latestInspection.answers.length}`);
      console.log(`- Total de avarias no blueprint: ${latestInspection.damage_markings.length}`);
    }

    console.log('\n✅ [TESTE APROVADO]: Banco de Dados SQLite e Prisma ORM 100% operacionais!');
  } catch (error) {
    console.error('❌ Erro no teste do banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
