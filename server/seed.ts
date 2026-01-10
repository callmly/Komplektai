import { db } from "./db";
import {
  plans,
  optionGroups,
  options,
  featureGroups,
  features,
  planFeatures,
  siteContent,
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(planFeatures);
  await db.delete(features);
  await db.delete(featureGroups);
  await db.delete(options);
  await db.delete(optionGroups);
  await db.delete(plans);
  await db.delete(siteContent);

  // Create plans
  const [starterPlan] = await db
    .insert(plans)
    .values({
      slug: "starter",
      nameLt: "Pradinis",
      taglineLt: "Idealus pradžiai",
      descriptionLt: "KNX valdiklis\nIki 10 apšvietimo taškų\nBazinis jungiklis\nMobili aplikacija",
      basePriceCents: 299900,
      isHighlighted: false,
      sortOrder: 0,
    })
    .returning();

  const [proPlan] = await db
    .insert(plans)
    .values({
      slug: "professional",
      nameLt: "Profesionalus",
      taglineLt: "Populiariausias pasirinkimas",
      descriptionLt: "KNX valdiklis\nIki 30 apšvietimo taškų\nStiklinis jungiklis\nMobili aplikacija\nŽaliuzių valdymas\nKlimatizacijos integracija",
      basePriceCents: 599900,
      isHighlighted: true,
      sortOrder: 1,
    })
    .returning();

  const [premiumPlan] = await db
    .insert(plans)
    .values({
      slug: "premium",
      nameLt: "Premium",
      taglineLt: "Viskas įskaičiuota",
      descriptionLt: "KNX valdiklis\nNeriboti apšvietimo taškai\nPremium jungiklis\nMobili aplikacija\nŽaliuzių valdymas\nKlimatizacijos integracija\nApsaugos sistema\nMultimedia integracija\n24/7 palaikymas",
      basePriceCents: 999900,
      isHighlighted: false,
      sortOrder: 2,
    })
    .returning();

  // Create option groups
  const [quantityGroup] = await db
    .insert(optionGroups)
    .values({
      typeLt: "quantity",
      titleLt: "Apšvietimo taškai",
      descriptionLt: "Pasirinkite apšvietimo taškų skaičių",
      sortOrder: 0,
    })
    .returning();

  const [switchGroup] = await db
    .insert(optionGroups)
    .values({
      typeLt: "switch",
      titleLt: "Jungiklio tipas",
      descriptionLt: "Pasirinkite jungiklio dizainą",
      sortOrder: 1,
    })
    .returning();

  const [addonGroup] = await db
    .insert(optionGroups)
    .values({
      typeLt: "addon",
      titleLt: "Papildomos funkcijos",
      descriptionLt: "Išplėskite savo sistemą",
      sortOrder: 2,
    })
    .returning();

  // Create options
  await db.insert(options).values([
    {
      groupId: quantityGroup.id,
      labelLt: "Apšvietimo taškas",
      descriptionLt: "Vienas LED apšvietimo taškas",
      unitPriceCents: 4500,
      minQty: 1,
      maxQty: 100,
      defaultQty: 10,
      isDefault: true,
      sortOrder: 0,
    },
    {
      groupId: quantityGroup.id,
      labelLt: "Žaliuzių variklis",
      descriptionLt: "Automatinis žaliuzių valdymas",
      unitPriceCents: 15000,
      minQty: 1,
      maxQty: 20,
      defaultQty: 2,
      isDefault: false,
      sortOrder: 1,
    },
  ]);

  await db.insert(options).values([
    {
      groupId: switchGroup.id,
      labelLt: "Bazinis plastikinis",
      descriptionLt: "Standartinis plastikinis jungiklis",
      unitPriceCents: 0,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: true,
      sortOrder: 0,
    },
    {
      groupId: switchGroup.id,
      labelLt: "Stiklinis jutiklinis",
      descriptionLt: "Elegantiškas stiklinis jungiklis",
      unitPriceCents: 8500,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: false,
      sortOrder: 1,
    },
    {
      groupId: switchGroup.id,
      labelLt: "Premium metalinis",
      descriptionLt: "Aukščiausios kokybės metalinis jungiklis",
      unitPriceCents: 15000,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: false,
      sortOrder: 2,
    },
  ]);

  await db.insert(options).values([
    {
      groupId: addonGroup.id,
      labelLt: "Klimato valdymas",
      descriptionLt: "Šildymo ir vėdinimo integracija",
      unitPriceCents: 45000,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: false,
      sortOrder: 0,
    },
    {
      groupId: addonGroup.id,
      labelLt: "Apsaugos sistema",
      descriptionLt: "Signalizacija ir jutikliai",
      unitPriceCents: 75000,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: false,
      sortOrder: 1,
    },
    {
      groupId: addonGroup.id,
      labelLt: "Multimedija",
      descriptionLt: "Garso ir vaizdo sistema",
      unitPriceCents: 55000,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      isDefault: false,
      sortOrder: 2,
    },
  ]);

  // Create feature groups
  const [hardwareGroup] = await db
    .insert(featureGroups)
    .values({
      titleLt: "Aparatūra",
      sortOrder: 0,
    })
    .returning();

  const [softwareGroup] = await db
    .insert(featureGroups)
    .values({
      titleLt: "Programinė įranga",
      sortOrder: 1,
    })
    .returning();

  const [supportGroup] = await db
    .insert(featureGroups)
    .values({
      titleLt: "Palaikymas",
      sortOrder: 2,
    })
    .returning();

  // Create features
  const hardwareFeatures = await db
    .insert(features)
    .values([
      { groupId: hardwareGroup.id, labelLt: "KNX valdiklis", valueType: "boolean", sortOrder: 0 },
      { groupId: hardwareGroup.id, labelLt: "Apšvietimo taškai", valueType: "text", sortOrder: 1 },
      { groupId: hardwareGroup.id, labelLt: "Jungiklio tipas", valueType: "text", sortOrder: 2 },
      { groupId: hardwareGroup.id, labelLt: "Žaliuzių valdymas", valueType: "boolean", sortOrder: 3 },
    ])
    .returning();

  const softwareFeatures = await db
    .insert(features)
    .values([
      { groupId: softwareGroup.id, labelLt: "Mobili aplikacija", valueType: "boolean", sortOrder: 0 },
      { groupId: softwareGroup.id, labelLt: "Balso valdymas", valueType: "boolean", sortOrder: 1 },
      { groupId: softwareGroup.id, labelLt: "Scenarijai", valueType: "text", sortOrder: 2 },
    ])
    .returning();

  const supportFeatures = await db
    .insert(features)
    .values([
      { groupId: supportGroup.id, labelLt: "Garantija", valueType: "text", sortOrder: 0 },
      { groupId: supportGroup.id, labelLt: "Techninė pagalba", valueType: "text", sortOrder: 1 },
      { groupId: supportGroup.id, labelLt: "Mokymasi", valueType: "boolean", sortOrder: 2 },
    ])
    .returning();

  // Create plan features
  const allFeatures = [...hardwareFeatures, ...softwareFeatures, ...supportFeatures];

  // Starter plan features
  await db.insert(planFeatures).values([
    { featureId: hardwareFeatures[0].id, planId: starterPlan.id, valueBoolean: true },
    { featureId: hardwareFeatures[1].id, planId: starterPlan.id, valueText: "Iki 10" },
    { featureId: hardwareFeatures[2].id, planId: starterPlan.id, valueText: "Bazinis" },
    { featureId: hardwareFeatures[3].id, planId: starterPlan.id, valueBoolean: false },
    { featureId: softwareFeatures[0].id, planId: starterPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[1].id, planId: starterPlan.id, valueBoolean: false },
    { featureId: softwareFeatures[2].id, planId: starterPlan.id, valueText: "5" },
    { featureId: supportFeatures[0].id, planId: starterPlan.id, valueText: "2 metai" },
    { featureId: supportFeatures[1].id, planId: starterPlan.id, valueText: "El. paštu" },
    { featureId: supportFeatures[2].id, planId: starterPlan.id, valueBoolean: false },
  ]);

  // Pro plan features
  await db.insert(planFeatures).values([
    { featureId: hardwareFeatures[0].id, planId: proPlan.id, valueBoolean: true },
    { featureId: hardwareFeatures[1].id, planId: proPlan.id, valueText: "Iki 30" },
    { featureId: hardwareFeatures[2].id, planId: proPlan.id, valueText: "Stiklinis" },
    { featureId: hardwareFeatures[3].id, planId: proPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[0].id, planId: proPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[1].id, planId: proPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[2].id, planId: proPlan.id, valueText: "20" },
    { featureId: supportFeatures[0].id, planId: proPlan.id, valueText: "5 metai" },
    { featureId: supportFeatures[1].id, planId: proPlan.id, valueText: "Telefonu" },
    { featureId: supportFeatures[2].id, planId: proPlan.id, valueBoolean: true },
  ]);

  // Premium plan features
  await db.insert(planFeatures).values([
    { featureId: hardwareFeatures[0].id, planId: premiumPlan.id, valueBoolean: true },
    { featureId: hardwareFeatures[1].id, planId: premiumPlan.id, valueText: "Neribota" },
    { featureId: hardwareFeatures[2].id, planId: premiumPlan.id, valueText: "Premium" },
    { featureId: hardwareFeatures[3].id, planId: premiumPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[0].id, planId: premiumPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[1].id, planId: premiumPlan.id, valueBoolean: true },
    { featureId: softwareFeatures[2].id, planId: premiumPlan.id, valueText: "Neribota" },
    { featureId: supportFeatures[0].id, planId: premiumPlan.id, valueText: "Visą laiką" },
    { featureId: supportFeatures[1].id, planId: premiumPlan.id, valueText: "24/7" },
    { featureId: supportFeatures[2].id, planId: premiumPlan.id, valueBoolean: true },
  ]);

  // Create site content
  await db.insert(siteContent).values([
    {
      key: "header",
      headingLt: "KNX Smart Home",
      ctaLabelLt: "Pasirinkti planą",
    },
    {
      key: "hero",
      headingLt: "Išmanus namas su KNX technologija",
      bodyLt: "Automatizuokite savo namus su pasauliniu standartu. Valdykite apšvietimą, šildymą, žaliuzes ir kitus prietaisus iš vienos sistemos.",
      ctaLabelLt: "Pasirinkti planą",
    },
    {
      key: "contact",
      headingLt: "Susisiekite",
      bodyLt: "Vilnius, Lietuva",
    },
    {
      key: "footer",
      headingLt: "KNX Smart Home",
      bodyLt: "Profesionalios namų automatizacijos sprendimai su KNX technologija. Sertifikuoti specialistai su ilgamete patirtimi.",
    },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
