const prisma = require("../server/utills/db");

async function main() {
  // 1. Update Demo Merchant with complete professional info
  await prisma.merchant.upsert({
    where: { id: "1" },
    update: {
      name: "Singitronic Official Store",
      description: "Authorized flagship electronics distributor with 2-year manufacturer warranty and express fulfillment.",
      email: "merchants@singitronic.com",
      phone: "+1 (800) 555-0194",
      address: "742 Innovation Drive, Austin, TX 78701",
      status: "ACTIVE",
    },
    create: {
      id: "1",
      name: "Singitronic Official Store",
      description: "Authorized flagship electronics distributor with 2-year manufacturer warranty and express fulfillment.",
      email: "merchants@singitronic.com",
      phone: "+1 (800) 555-0194",
      address: "742 Innovation Drive, Austin, TX 78701",
      status: "ACTIVE",
    },
  });

  // 2. Enrich existing products with crisp, authentic descriptions & realistic stock/prices
  const productUpdates = [
    {
      id: "1",
      title: "Galaxy S24 Pro Smartphone",
      price: 699,
      rating: 5,
      inStock: 18,
      manufacturer: "Samsung",
      description: "Flagship 6.7-inch Dynamic AMOLED 2X display with 120Hz adaptive refresh rate, pro-grade triple camera system, all-day 5000mAh battery, and ultra-fast 5G connectivity in an aerospace aluminum frame.",
    },
    {
      id: "2",
      title: "EOS R50 Mirrorless Camera",
      price: 649,
      rating: 5,
      inStock: 9,
      manufacturer: "Canon",
      description: "Compact 24.2MP APS-C CMOS sensor with DIGIC X image processor, Dual Pixel CMOS AF II subject tracking, uncropped 4K 30p video recording, and vari-angle touchscreen for creators.",
    },
    {
      id: "3",
      title: "ProBlend 1000W Mixer Grinder",
      price: 89,
      rating: 4,
      inStock: 24,
      manufacturer: "ZunVolt",
      description: "Heavy-duty 1000W copper motor mixer grinder featuring three food-grade stainless steel jars, precision titanium-coated blades, 3-speed pulse control, and overload protection.",
    },
    {
      id: "4",
      title: "SteadyShot 3-Axis Phone Gimbal",
      price: 119,
      rating: 5,
      inStock: 15,
      manufacturer: "DJI",
      description: "Foldable 3-axis smartphone stabilizer with magnetic quick-release clamp, built-in extension rod, ActiveTrack 6.0 subject tracking, and 8-hour battery life for cinema-smooth video.",
    },
    {
      id: "5",
      title: "UltraSlim Folio Tablet Keyboard",
      price: 129,
      rating: 4,
      inStock: 22,
      manufacturer: "Samsung",
      description: "Precision backlit scissor-switch keyboard cover with multi-gesture glass trackpad, magnetic snap attachment, dedicated media function row, and dual viewing angles.",
    },
    {
      id: "6",
      title: "Galaxy Buds3 Pro ANC Earbuds",
      price: 179,
      rating: 5,
      inStock: 31,
      manufacturer: "Samsung",
      description: "True wireless earbuds engineered with 24-bit Hi-Fi dual drivers, intelligent Adaptive Active Noise Cancellation, IP57 water resistance, and up to 30 hours of listening with the wireless charging case.",
    },
    {
      id: "7",
      title: "SoundSurge 360 Party Speaker",
      price: 149,
      rating: 5,
      inStock: 14,
      manufacturer: "SOWO",
      description: "Portable 60W waterproof Bluetooth speaker delivering deep bass with dual passive radiators, synchronized RGB ambient lighting, StereoBoom pairing, and 18-hour playtime.",
    },
    {
      id: "8",
      title: "VitaExtract Cold Press Juicer",
      price: 199,
      rating: 4,
      inStock: 11,
      manufacturer: "Bosch",
      description: "Whisper-quiet slow masticating juicer operating at 55 RPM to preserve maximum vitamins and enzymes, featuring a wide feed chute, drip-stop spout, and dishwasher-safe Tritan parts.",
    },
    {
      id: "9",
      title: "WH-1000XM5 Wireless Headphones",
      price: 329,
      rating: 5,
      inStock: 19,
      manufacturer: "Sony",
      description: "Industry-leading noise cancelling over-ear headphones powered by dual processors and eight microphones, LDAC Hi-Res Wireless audio, plush memory-foam earcups, and 30-hour battery with quick charge.",
    },
    {
      id: "10",
      title: "Galaxy Watch Ultra Titanium",
      price: 399,
      rating: 5,
      inStock: 16,
      manufacturer: "Samsung",
      description: "Aerospace-grade titanium smartwatch with sapphire crystal 3000-nit AMOLED display, dual-frequency GPS, advanced ECG & sleep coaching, 100m water resistance, and multi-day endurance.",
    },
    {
      id: "11",
      title: "HorizonBook 15 Pro Laptop",
      price: 949,
      rating: 5,
      inStock: 8,
      manufacturer: "HP",
      description: "Sleek aluminum ultrabook featuring a 15.6-inch 2.5K IPS display, 16GB LPDDR5 RAM, 1TB NVMe SSD, Wi-Fi 6E, Thunderbolt 4 ports, backlit keyboard, and fast USB-C charging.",
    },
    {
      id: "12",
      title: "ProGlide Precision Beard Trimmer",
      price: 64,
      rating: 4,
      inStock: 0,
      manufacturer: "Braun",
      description: "Cordless waterproof grooming kit with lifetime-sharp stainless steel blades, 40 precision length settings via ProWheel dial, AutoSense motor technology, and 100-minute Li-Ion runtime.",
    },
  ];

  for (const p of productUpdates) {
    await prisma.product.updateMany({
      where: { id: p.id },
      data: {
        title: p.title,
        price: p.price,
        rating: p.rating,
        inStock: p.inStock,
        manufacturer: p.manufacturer,
        description: p.description,
      },
    });
  }

  // 3. Add products for empty categories (Mouses, PCs, Printers) so every category has real items
  const extraProducts = [
    {
      id: "13",
      slug: "precision-wireless-mouse",
      title: "MX Master Ergonomic Wireless Mouse",
      mainImage: "mouse 1.png",
      price: 99,
      rating: 5,
      description: "Sculpted ergonomic wireless mouse with 8000 DPI darkfield optical sensor, electromagnetic MagSpeed scroll wheel, quiet tactile clicks, and multi-device Bluetooth & USB-C switching.",
      manufacturer: "Logitech",
      inStock: 27,
      categoryId: "da6413b4-22fd-4fbb-9741-d77580dfdcd5",
      merchantId: "1",
    },
    {
      id: "14",
      slug: "prostudio-workstation-pc",
      title: "ProStudio Creator Desktop PC",
      mainImage: "pc 1.png",
      price: 1299,
      rating: 5,
      description: "High-performance tower workstation engineered for gaming, 3D rendering, and development, equipped with 32GB DDR5 memory, 1TB Gen4 NVMe SSD, whisper-quiet airflow cooling, and tempered glass chassis.",
      manufacturer: "ASUS",
      inStock: 6,
      categoryId: "ss6412b4-22fd-4fbb-9741-d77580dfdcd2",
      merchantId: "1",
    },
    {
      id: "15",
      slug: "laserjet-wireless-printer",
      title: "EcoTank All-in-One Wireless Printer",
      mainImage: "printer 1.png",
      price: 249,
      rating: 4,
      description: "Cartridge-free color multifunction printer with auto-duplex printing, high-resolution flatbed scanner, Wi-Fi Direct & AirPrint mobile printing, and high-yield ink tanks good for up to 4,500 pages.",
      manufacturer: "Epson",
      inStock: 12,
      categoryId: "fs6412b4-22fd-4fbb-9741-d77512dfdfa3",
      merchantId: "1",
    },
    {
      id: "16",
      slug: "skyvision-4k-camera-drone",
      title: "SkyVision Mini 4K Camera Drone",
      mainImage: "drone.png",
      price: 459,
      rating: 5,
      description: "Ultralight under-249g folding camera drone with 3-axis gimbal 4K/60fps HDR video, omnidirectional obstacle sensing, 10km HD video transmission, and 34-minute flight time.",
      manufacturer: "DJI",
      inStock: 0,
      categoryId: "659a91b9-3ff6-47d5-9830-5e7ac905b961",
      merchantId: "1",
    },
  ];

  for (const ep of extraProducts) {
    await prisma.product.upsert({
      where: { id: ep.id },
      update: {},
      create: ep,
    });
  }

  // 4. Seed gallery images for key products (idempotent)
  const existingImages = await prisma.image.count();
  if (existingImages === 0) {
    const galleryImages = [
      { imageID: "img-1-1", productID: "1", image: "smart phone 1.png" },
      { imageID: "img-1-2", productID: "1", image: "smart phone 2.png" },
      { imageID: "img-1-3", productID: "1", image: "smart phone 3.png" },
      { imageID: "img-2-1", productID: "2", image: "camera 1.png" },
      { imageID: "img-2-2", productID: "2", image: "camera 3.png" },
      { imageID: "img-6-1", productID: "6", image: "earbuds 1.png" },
      { imageID: "img-6-2", productID: "6", image: "earbuds 2.png" },
      { imageID: "img-9-1", productID: "9", image: "headphones 1.png" },
      { imageID: "img-9-2", productID: "9", image: "headphones 2.png" },
      { imageID: "img-10-1", productID: "10", image: "smart watch 1.png" },
      { imageID: "img-10-2", productID: "10", image: "smart watch 2.png" },
      { imageID: "img-11-1", productID: "11", image: "laptop 1.webp" },
      { imageID: "img-11-2", productID: "11", image: "laptop 2.webp" },
      { imageID: "img-13-1", productID: "13", image: "mouse 1 2.png" },
      { imageID: "img-13-2", productID: "13", image: "mouse 1 3.png" },
      { imageID: "img-14-1", productID: "14", image: "pc 2.png" },
      { imageID: "img-14-2", productID: "14", image: "pc 3.png" },
      { imageID: "img-15-1", productID: "15", image: "printer 2.png" },
    ];
    for (const img of galleryImages) {
      await prisma.image.create({ data: img });
    }
    console.log("Seeded product gallery images!");
  }

  // 5. Seed initial customer reviews (idempotent)
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    const sampleReviews = [
      {
        productId: "1",
        author: "Daniel Mwangi",
        rating: 5,
        title: "Blazing fast display and battery life",
        comment: "Upgraded from a 3-year-old phone and the difference is night and day. The 120Hz screen is gorgeous and the battery easily lasts through a full workday.",
        verified: true,
      },
      {
        productId: "1",
        author: "Sarah Chen",
        rating: 5,
        title: "Incredible night camera quality",
        comment: "Photos are sharp even in low light, and shipping from Singitronic took only two days. Highly recommend.",
        verified: true,
      },
      {
        productId: "9",
        author: "Marcus Reid",
        rating: 5,
        title: "Best noise cancellation I have ever tried",
        comment: "Completely silences airplane cabin noise and office chatter. Super comfortable for 6+ hour coding sessions.",
        verified: true,
      },
      {
        productId: "10",
        author: "Amina Ochieng",
        rating: 5,
        title: "Crystal-clear screen outdoors",
        comment: "Perfect fitness and productivity companion. GPS locks on in seconds and sleep tracking is impressively accurate.",
        verified: true,
      },
      {
        productId: "11",
        author: "Lucas Novak",
        rating: 5,
        title: "Silent, fast, and premium build",
        comment: "Handles heavy multitasking effortlessly. The keyboard feels great and USB-C charging is super convenient.",
        verified: true,
      },
      {
        productId: "13",
        author: "Elena Petrova",
        rating: 5,
        title: "Saved my wrist during long workdays",
        comment: "The electromagnetic scroll wheel is addictive and switching between my laptop and desktop takes one click.",
        verified: true,
      },
    ];
    for (const r of sampleReviews) {
      await prisma.review.create({ data: r });
    }
    console.log("Seeded sample reviews!");
  }

  // 6. Seed default store settings (idempotent)
  const defaultSettings = {
    storeName: "Singitronic",
    supportEmail: "support@singitronic.com",
    supportPhone: "+1 (800) 555-0194",
    storeAddress: "742 Innovation Drive, Austin, TX 78701",
    shippingFee: "10",
    freeShippingThreshold: "150",
    taxRate: "8",
    currency: "USD",
    announcementText: "Free express shipping on orders over $150 · Use code SAVE10 for 10% off",
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.storeSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // 7. Seed sample customer orders so Admin Dashboard has realistic analytics (idempotent)
  const existingOrders = await prisma.customer_order.count();
  if (existingOrders === 0) {
    const order1 = await prisma.customer_order.create({
      data: {
        id: "ord-demo-1001",
        name: "Sarah",
        lastname: "Chen",
        phone: "+1 415 555 0142",
        email: "sarah.chen@example.com",
        company: "Northstar Studio",
        adress: "420 Market Street",
        apartment: "Suite 8B",
        postalCode: "94105",
        status: "delivered",
        city: "San Francisco",
        country: "United States",
        orderNotice: "Leave with front desk concierge.",
        total: 1110,
        dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.customer_order_product.create({
      data: { customerOrderId: order1.id, productId: "1", quantity: 1 },
    });
    await prisma.customer_order_product.create({
      data: { customerOrderId: order1.id, productId: "9", quantity: 1 },
    });

    const order2 = await prisma.customer_order.create({
      data: {
        id: "ord-demo-1002",
        name: "Daniel",
        lastname: "Mwangi",
        phone: "+254 712 345 678",
        email: "daniel.mwangi@example.com",
        company: "Kibo Tech Labs",
        adress: "18 Kenyatta Avenue",
        apartment: "Floor 4",
        postalCode: "00100",
        status: "shipped",
        city: "Nairobi",
        country: "Kenya",
        orderNotice: "Call upon arrival.",
        total: 538,
        dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.customer_order_product.create({
      data: { customerOrderId: order2.id, productId: "10", quantity: 1 },
    });
    await prisma.customer_order_product.create({
      data: { customerOrderId: order2.id, productId: "13", quantity: 1 },
    });

    const order3 = await prisma.customer_order.create({
      data: {
        id: "ord-demo-1003",
        name: "Elena",
        lastname: "Petrova",
        phone: "+44 20 7946 0921",
        email: "admin@singitronic.com",
        company: "Singitronic QA",
        adress: "85 King William Street",
        apartment: "Apt 12",
        postalCode: "EC4N 7BL",
        status: "processing",
        city: "London",
        country: "United Kingdom",
        orderNotice: null,
        total: 1025,
        dateTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    });
    await prisma.customer_order_product.create({
      data: { customerOrderId: order3.id, productId: "11", quantity: 1 },
    });

    console.log("Seeded sample customer orders!");
  }

  console.log("Database enrichment complete!");
}

main()
  .catch((err) => {
    console.error("Seed enrichment error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
