import { User, Property, Booking, Review, ContactRequest, Message, Notification } from '../types';

const now = new Date().toISOString();

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Sharma', email: 'alice@example.com', role: 'host', profilePhoto: 'https://i.pravatar.cc/150?u=alice', createdAt: '2025-06-01T00:00:00Z' },
  { id: '2', name: 'Bob Patel', email: 'bob@example.com', role: 'guest', profilePhoto: 'https://i.pravatar.cc/150?u=bob', createdAt: '2025-07-15T00:00:00Z' },
  { id: '3', name: 'Carol Mehta', email: 'carol@example.com', role: 'host', profilePhoto: 'https://i.pravatar.cc/150?u=carol', createdAt: '2025-05-10T00:00:00Z' },
  { id: '4', name: 'Admin Singh', email: 'admin@example.com', role: 'admin', profilePhoto: 'https://i.pravatar.cc/150?u=admin', createdAt: '2025-01-01T00:00:00Z' },
  { id: '5', name: 'Diana Gupta', email: 'diana@example.com', role: 'guest', profilePhoto: 'https://i.pravatar.cc/150?u=diana', createdAt: '2025-08-20T00:00:00Z' },
  { id: '6', name: 'Ethan Kumar', email: 'ethan@example.com', role: 'host', profilePhoto: 'https://i.pravatar.cc/150?u=ethan', createdAt: '2025-04-05T00:00:00Z' },
  { id: '7', name: 'Fiona Reddy', email: 'fiona@example.com', role: 'guest', profilePhoto: 'https://i.pravatar.cc/150?u=fiona', createdAt: '2025-09-10T00:00:00Z' },
  { id: '8', name: 'Guest Demo', email: 'guest@demo.com', role: 'guest', profilePhoto: '', createdAt: now },
  { id: '9', name: 'Host Demo', email: 'host@demo.com', role: 'host', profilePhoto: '', createdAt: now },
];

export const mockProperties: Property[] = [
  // === Alice's properties (hostId: 1) ===
  {
    id: '1', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Seaside Villa with Private Pool',
    description: 'Enjoy breathtaking ocean views from this modern 4-BR villa. Infinity pool, outdoor kitchen, direct beach access. Perfect for families or groups seeking a luxury coastal escape. Fully staffed with a caretaker and chef available on request.',
    pricePerNight: 250, location: 'Goa, India',
    photos: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Beach Access', 'Chef'],
    isActive: true, avgRating: 4.8, reviewCount: 24, createdAt: '2025-06-10T00:00:00Z',
    blockedDates: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-10-10', '2026-10-11', '2026-10-12'],
  },
  {
    id: '2', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Cozy Mountain Cabin',
    description: 'Rustic pine-log cabin with wood-burning fireplace and forest views. Hike trails from your doorstep. Includes a hot tub on the deck and a fully equipped kitchen. Unplug and reconnect with nature in this serene Himalayan retreat.',
    pricePerNight: 120, location: 'Manali, India',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
    ],
    amenities: ['Fireplace', 'Hiking', 'Kitchen', 'Parking', 'Hot Tub', 'Pet Friendly'],
    isActive: true, avgRating: 4.6, reviewCount: 18, createdAt: '2025-06-20T00:00:00Z',
  },
  {
    id: '5', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Heritage Haveli Suite',
    description: 'Experience royalty in this restored 18th-century haveli. Ornate architecture with hand-painted murals, a rooftop terrace overlooking the Pink City, and traditional Rajasthani hospitality. Includes a personal butler, vintage car tours, and authentic cooking classes.',
    pricePerNight: 350, location: 'Jaipur, India',
    photos: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Breakfast', 'Parking', 'Rooftop', 'Butler', 'Cooking Class'],
    isActive: true, avgRating: 5.0, reviewCount: 42, createdAt: '2025-07-01T00:00:00Z',
  },
  {
    id: '7', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Luxury Penthouse Suite',
    description: 'Top-floor penthouse with 360° panoramic city views, private terrace with plunge pool, and 24/7 butler service. Three bedrooms with en-suite marble bathrooms, a gourmet kitchen, and a home theater. The ultimate urban luxury experience.',
    pricePerNight: 500, location: 'Delhi, India',
    photos: [
      'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Butler', 'Gym', 'Pool', 'Parking', 'Home Theater', 'Bar'],
    isActive: true, avgRating: 4.9, reviewCount: 37, createdAt: '2025-07-15T00:00:00Z',
  },
  {
    id: '9', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Riverside Cottage',
    description: 'Charming 2-BR cottage on the banks of the Ganges. Fall asleep to the sound of flowing water. Includes a private garden, bonfire pit, and complimentary breakfast. Ideal for couples and small families seeking peace and quiet.',
    pricePerNight: 100, location: 'Rishikesh, India',
    photos: [
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
    ],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Bonfire', 'Garden', 'Breakfast'],
    isActive: true, avgRating: 4.3, reviewCount: 9, createdAt: '2025-08-01T00:00:00Z',
  },

  // === Carol's properties (hostId: 3) ===
  {
    id: '3', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Modern City Loft',
    description: 'Sleek downtown loft with floor-to-ceiling windows and skyline views. Walking distance to Colaba Causeway, Marine Drive, and top restaurants. Polished concrete floors, minimalist decor, and a rooftop pool. The perfect base for exploring Mumbai.',
    pricePerNight: 180, location: 'Mumbai, India',
    photos: [
      'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Gym', 'Elevator', 'Pool', 'Security'],
    isActive: true, avgRating: 4.9, reviewCount: 31, createdAt: '2025-06-05T00:00:00Z',
  },
  {
    id: '4', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Beachfront Bungalow',
    description: 'Wake up to waves at this charming beachfront bungalow. Private deck with hammock, outdoor rain shower, and nightly bonfires on the beach. Two bedrooms with ocean views in every room. The perfect romantic getaway.',
    pricePerNight: 200, location: 'Kerala, India',
    photos: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Beach Access', 'Bonfire', 'Kayak'],
    isActive: true, avgRating: 4.7, reviewCount: 15, createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: '6', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Lakeside Treehouse Retreat',
    description: 'Sleep among the treetops in this magical treehouse overlooking Lake Pichola. Features a zip line, private canoe, outdoor stargazing deck with telescope, and an open-air bathroom. A one-of-a-kind experience you will never forget.',
    pricePerNight: 160, location: 'Udaipur, India',
    photos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
    ],
    amenities: ['WiFi', 'Kitchen', 'Canoe', 'Parking', 'Telescope', 'Zip Line'],
    isActive: true, avgRating: 4.5, reviewCount: 9, createdAt: '2025-07-10T00:00:00Z',
  },
  {
    id: '8', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Organic Farm Stay',
    description: 'Live on a working 5-acre organic farm. Pick fresh vegetables, feed goats and chickens, enjoy farm-to-table meals prepared by your hosts. Two cozy cottages with solar power and compost toilets. Perfect for families and eco-conscious travelers.',
    pricePerNight: 90, location: 'Pune, India',
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    amenities: ['Kitchen', 'Parking', 'Farm Activities', 'Pet Friendly', 'Bonfire', 'Organic Meals'],
    isActive: true, avgRating: 4.4, reviewCount: 12, createdAt: '2025-08-10T00:00:00Z',
    blockedDates: ['2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-25'],
  },
  {
    id: '12', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Hilltop Villa with Infinity Pool',
    description: 'Perched on a hilltop in the Western Ghats, this 5-BR villa offers sweeping valley views. Infinity pool, outdoor jacuzzi, billiards room, and a private bartender. The ultimate group getaway destination with space for 12 guests.',
    pricePerNight: 450, location: 'Lonavala, India',
    photos: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Jacuzzi', 'Billiards', 'Bar'],
    isActive: true, avgRating: 4.7, reviewCount: 21, createdAt: '2025-08-20T00:00:00Z',
  },

  // === Ethan's properties (hostId: 6) ===
  {
    id: '10', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Glass House in the Woods',
    description: 'A stunning glass-walled home surrounded by ancient oaks. Watch wildlife from your bed, soak in the outdoor claw-foot tub under the stars, and cook in a gourmet kitchen. Total privacy on 10 forested acres with a private stream.',
    pricePerNight: 280, location: 'Coorg, India',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
    ],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Jacuzzi', 'Bonfire', 'Hiking'],
    isActive: true, avgRating: 4.9, reviewCount: 14, createdAt: '2025-07-05T00:00:00Z',
  },
  {
    id: '11', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Colonial Bungalow with Garden',
    description: 'Restored British-era bungalow set in 2 acres of manicured gardens. Wide verandas, four-poster beds, a library with vintage books, and an outdoor pool surrounded by bougainvillea. Step back in time with modern comforts.',
    pricePerNight: 220, location: 'Ooty, India',
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Parking', 'Library', 'Garden', 'Breakfast'],
    isActive: true, avgRating: 4.8, reviewCount: 26, createdAt: '2025-07-20T00:00:00Z',
  },
  {
    id: '13', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Desert Camp under the Stars',
    description: 'A luxury glamping experience in the Thar Desert. Stay in a spacious tent with a real bed, solar lighting, and an attached bathroom. Enjoy camel safaris, Rajasthani folk music, and a dinner under the most starry sky you have ever seen.',
    pricePerNight: 130, location: 'Jaisalmer, India',
    photos: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800',
    ],
    amenities: ['Bonfire', 'Parking', 'Breakfast', 'Camel Safari', 'Folk Music'],
    isActive: true, avgRating: 4.6, reviewCount: 8, createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: '14', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Tea Estate Cottage',
    description: 'Wake up to rolling tea gardens stretching to the horizon. This cozy cottage on a working tea estate includes guided plantation walks, tea-tasting sessions, and stunning sunrise views over the valleys of Munnar.',
    pricePerNight: 110, location: 'Munnar, India',
    photos: [
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Tea Tasting', 'Hiking', 'Breakfast'],
    isActive: true, avgRating: 4.7, reviewCount: 19, createdAt: '2025-09-10T00:00:00Z',
  },
  {
    id: '15', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Houseboat on the Backwaters',
    description: 'A traditional kettuvallam houseboat gliding through the Kerala backwaters. Fully furnished with a bedroom, attached bathroom, sun deck, and private chef serving fresh seafood. Drift past palm-fringed canals and vibrant village life.',
    pricePerNight: 190, location: 'Alleppey, India',
    photos: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    amenities: ['AC', 'Kitchen', 'Sun Deck', 'Fishing', 'Chef', 'Breakfast'],
    isActive: true, avgRating: 4.5, reviewCount: 33, createdAt: '2025-09-15T00:00:00Z',
  },

  // === More variety properties ===
  {
    id: '16', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Eco-Dome with Valley View',
    description: 'Stay in a futuristic geodesic dome with panoramic valley views. Solar-powered, rainwater harvesting, and organic toiletries. Includes a private infinity pool and a telescope for stargazing. Off-grid luxury at its finest.',
    pricePerNight: 300, location: 'Dharamshala, India',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Telescope', 'Eco-Friendly'],
    isActive: true, avgRating: 4.8, reviewCount: 7, createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: '17', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Studio near MG Road',
    description: 'Compact and smart studio apartment in the heart of Bangalore. Walking distance to MG Road metro, Brigade Road shopping, and Indiranagar nightlife. High-speed WiFi, smart TV, and a fully equipped kitchenette. Perfect for business travelers.',
    pricePerNight: 55, location: 'Bangalore, India',
    photos: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Gym', 'Security'],
    isActive: true, avgRating: 4.2, reviewCount: 45, createdAt: '2025-10-05T00:00:00Z',
  },
  {
    id: '18', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Fort View Haveli',
    description: 'A beautifully restored haveli with direct views of Mehrangarh Fort. Intricate jharokha windows, a courtyard with a fountain, and a rooftop restaurant. Experience the blue city like royalty with guided heritage walks included.',
    pricePerNight: 260, location: 'Jodhpur, India',
    photos: [
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Restaurant', 'Parking', 'Heritage Walk', 'Rooftop'],
    isActive: true, avgRating: 4.6, reviewCount: 28, createdAt: '2025-10-10T00:00:00Z',
  },
  {
    id: '19', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Snowy Mountain Chalet',
    description: 'A warm wooden chalet in the snow-clad mountains of Auli. Ski-in/ski-out access, a roaring fireplace, and floor-to-ceiling windows with Himalayan views. Includes ski equipment rental and a private hot tub on the deck.',
    pricePerNight: 320, location: 'Auli, India',
    photos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['Fireplace', 'Hot Tub', 'Ski Access', 'Parking', 'Kitchen', 'WiFi'],
    isActive: true, avgRating: 4.9, reviewCount: 11, createdAt: '2025-10-20T00:00:00Z',
  },
  {
    id: '20', hostId: '3', hostName: 'Carol Mehta', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Island Retreat in the Andamans',
    description: 'A private island cottage surrounded by turquoise waters and white sand beaches. Snorkel right from your doorstep, dine on freshly caught seafood, and fall asleep to the sound of gentle waves. A true paradise on earth.',
    pricePerNight: 400, location: 'Andaman Islands, India',
    photos: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
    ],
    amenities: ['Snorkeling', 'Beach Access', 'Kayak', 'Chef', 'Bonfire', 'Hammock'],
    isActive: true, avgRating: 5.0, reviewCount: 6, createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: '21', hostId: '6', hostName: 'Ethan Kumar', hostPhoto: 'https://i.pravatar.cc/150?u=ethan',
    title: 'Boutique Stay in Goa Arpora',
    description: 'A chic 1-BR suite in a boutique property near Anjuna Beach. Styled with Portuguese-Goan decor, a private plunge pool, and a lush tropical garden. Scooter rental available. Walk to Saturday Night Market and beach shacks.',
    pricePerNight: 80, location: 'Goa, India',
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Kitchen', 'Parking', 'Garden'],
    isActive: true, avgRating: 4.4, reviewCount: 53, createdAt: '2025-11-05T00:00:00Z',
  },
  {
    id: '22', hostId: '1', hostName: 'Alice Sharma', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Inactive Vintage Villa',
    description: 'This vintage villa is currently off-market for renovations.',
    pricePerNight: 0, location: 'Chennai, India',
    photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    amenities: [],
    isActive: false, avgRating: undefined, reviewCount: 0, createdAt: '2025-01-01T00:00:00Z',
  },
];

export const mockReviews: Review[] = [
  { id: 'r1', bookingId: 'b1', userId: '2', userName: 'Bob Patel', propertyId: '1', rating: 5, text: 'Absolutely incredible stay! The villa exceeded all expectations. The infinity pool with ocean views was the highlight. Alice was a wonderful host.', createdAt: '2026-08-22T00:00:00Z' },
  { id: 'r2', bookingId: 'b2', userId: '5', userName: 'Diana Gupta', propertyId: '1', rating: 4, text: 'Beautiful property with great amenities. The beach access is private and lovely. Only minor issue was the WiFi was a bit slow during peak hours.', createdAt: '2026-07-10T00:00:00Z' },
  { id: 'r3', bookingId: 'b3', userId: '7', userName: 'Fiona Reddy', propertyId: '1', rating: 5, text: 'Perfect family vacation spot. The kids loved the pool and we loved the private beach. The caretaker was extremely helpful. Will definitely return!', createdAt: '2026-06-15T00:00:00Z' },
  { id: 'r4', bookingId: 'b4', userId: '2', userName: 'Bob Patel', propertyId: '3', rating: 5, text: 'Best location in Mumbai! Walking distance to everything. The loft is exactly as pictured - modern, clean, and stunning views. Carol was super responsive.', createdAt: '2026-05-20T00:00:00Z' },
  { id: 'r5', bookingId: 'b5', userId: '5', userName: 'Diana Gupta', propertyId: '3', rating: 5, text: 'Stayed here for a business trip and it was perfect. Fast WiFi, great workspace, and the rooftop pool was a bonus after meetings.', createdAt: '2026-04-10T00:00:00Z' },
  { id: 'r6', bookingId: 'b6', userId: '7', userName: 'Fiona Reddy', propertyId: '5', rating: 5, text: 'The Heritage Haveli was the most magical experience of our India trip. The butler service, the rooftop views, the cooking class - everything was perfect. Alice went above and beyond.', createdAt: '2026-03-25T00:00:00Z' },
  { id: 'r7', bookingId: 'b7', userId: '2', userName: 'Bob Patel', propertyId: '5', rating: 5, text: 'Worth every penny. This is not just a stay, it is an experience. The vintage car tour of Jaipur was unforgettable.', createdAt: '2026-02-14T00:00:00Z' },
  { id: 'r8', bookingId: 'b8', userId: '5', userName: 'Diana Gupta', propertyId: '5', rating: 5, text: 'The most beautiful place I have ever stayed. Every corner of the haveli is photogenic. The staff treated us like royalty.', createdAt: '2026-01-30T00:00:00Z' },
  { id: 'r9', bookingId: 'b9', userId: '7', userName: 'Fiona Reddy', propertyId: '7', rating: 5, text: 'Penthouse is absolutely insane. The view from the terrace is worth the price alone. Butler service was impeccable.', createdAt: '2025-12-20T00:00:00Z' },
  { id: 'r10', bookingId: 'b10', userId: '2', userName: 'Bob Patel', propertyId: '2', rating: 4, text: 'Cozy cabin with a great fireplace. Perfect for a winter weekend getaway. The hot tub was a nice touch. A few more kitchen utensils would be helpful.', createdAt: '2025-11-10T00:00:00Z' },
  { id: 'r11', bookingId: 'b11', userId: '5', userName: 'Diana Gupta', propertyId: '2', rating: 5, text: 'Loved the hiking trails right from the property. The cabin is rustic but comfortable. Saw a family of deer on our morning walk!', createdAt: '2025-11-05T00:00:00Z' },
  { id: 'r12', bookingId: 'b12', userId: '7', userName: 'Fiona Reddy', propertyId: '4', rating: 4, text: 'Beautiful bungalow right on the beach. The hammock on the deck is the perfect spot for reading. Kayaking was fun too.', createdAt: '2025-10-28T00:00:00Z' },
  { id: 'r13', bookingId: 'b13', userId: '2', userName: 'Bob Patel', propertyId: '10', rating: 5, text: 'The glass house is magic. Waking up to the forest view is unreal. The outdoor tub under the stars was the highlight of our trip.', createdAt: '2025-10-15T00:00:00Z' },
  { id: 'r14', bookingId: 'b14', userId: '5', userName: 'Diana Gupta', propertyId: '11', rating: 4, text: 'Beautiful colonial property with a lovely garden. The library is a wonderful touch. The pool was well-maintained. Great for a relaxing weekend.', createdAt: '2025-09-20T00:00:00Z' },
  { id: 'r15', bookingId: 'b15', userId: '7', userName: 'Fiona Reddy', propertyId: '14', rating: 5, text: 'Tea estate is stunning! The plantation walk at sunrise was unforgettable. Learned so much about tea. The cottage is cozy and well-equipped.', createdAt: '2025-09-05T00:00:00Z' },
  { id: 'r16', bookingId: 'b16', userId: '2', userName: 'Bob Patel', propertyId: '15', rating: 5, text: 'Houseboat experience was a dream. Gliding through the backwaters, eating fresh seafood on the deck - pure bliss. Highly recommend.', createdAt: '2025-08-25T00:00:00Z' },
  { id: 'r17', bookingId: 'b17', userId: '5', userName: 'Diana Gupta', propertyId: '18', rating: 5, text: 'Jodhpur fort view from the rooftop is spectacular. The haveli is beautifully restored. The heritage walk was informative and fun.', createdAt: '2025-08-10T00:00:00Z' },
  { id: 'r18', bookingId: 'b18', userId: '7', userName: 'Fiona Reddy', propertyId: '17', rating: 4, text: 'Great location for Bangalore business travel. Compact but has everything you need. The gym is well-equipped.', createdAt: '2025-07-30T00:00:00Z' },
];

export const mockContactRequests: ContactRequest[] = [
  { id: 'cr1', propertyId: '1', propertyTitle: 'Seaside Villa with Private Pool', guestId: '2', guestName: 'Bob Patel', hostId: '1', hostName: 'Alice Sharma', status: 'approved', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-01T12:00:00Z' },
  { id: 'cr2', propertyId: '3', propertyTitle: 'Modern City Loft', guestId: '2', guestName: 'Bob Patel', hostId: '3', hostName: 'Carol Mehta', status: 'pending', message: 'Hi! I am interested in your loft for a weekend stay.', createdAt: '2026-08-20T09:00:00Z' },
  { id: 'cr3', propertyId: '5', propertyTitle: 'Heritage Haveli Suite', guestId: '5', guestName: 'Diana Gupta', hostId: '1', hostName: 'Alice Sharma', status: 'approved', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T14:00:00Z' },
  { id: 'cr4', propertyId: '1', propertyTitle: 'Seaside Villa with Private Pool', guestId: '7', guestName: 'Fiona Reddy', hostId: '1', hostName: 'Alice Sharma', status: 'declined', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-02T00:00:00Z' },
  { id: 'cr5', propertyId: '7', propertyTitle: 'Luxury Penthouse Suite', guestId: '8', guestName: 'Guest Demo', hostId: '1', hostName: 'Alice Sharma', status: 'pending', message: 'Would love to experience the penthouse!', createdAt: '2026-07-28T08:00:00Z' },
];

export const mockMessages: Message[] = [
  { id: 'm1', contactRequestId: 'cr1', senderId: '2', senderName: 'Bob Patel', text: 'Hi Alice! Is the villa available for August 15-20?', createdAt: '2026-07-01T10:00:00Z', readAt: '2026-07-01T11:30:00Z' },
  { id: 'm2', contactRequestId: 'cr1', senderId: '1', senderName: 'Alice Sharma', text: 'Yes, those dates are free! Would love to host you.', createdAt: '2026-07-01T11:30:00Z', readAt: '2026-07-01T12:00:00Z' },
  { id: 'm3', contactRequestId: 'cr1', senderId: '2', senderName: 'Bob Patel', text: 'Perfect! I just sent a booking request.', createdAt: '2026-07-01T12:00:00Z', readAt: '2026-07-01T13:00:00Z' },
  { id: 'm4', contactRequestId: 'cr1', senderId: '1', senderName: 'Alice Sharma', text: 'Confirmed! See you in August. Let me know if you need airport pickup.', createdAt: '2026-07-01T13:00:00Z', readAt: '2026-07-01T13:05:00Z' },
  { id: 'm5', contactRequestId: 'cr3', senderId: '5', senderName: 'Diana Gupta', text: 'Hi Alice! I am interested in the Heritage Haveli.', createdAt: '2026-02-01T10:00:00Z', readAt: '2026-02-01T14:00:00Z' },
  { id: 'm6', contactRequestId: 'cr3', senderId: '1', senderName: 'Alice Sharma', text: 'Hello Diana! The Haveli is available. Let me know your dates!', createdAt: '2026-02-01T14:00:00Z', readAt: '2026-02-02T09:00:00Z' },
  { id: 'm7', contactRequestId: 'cr3', senderId: '5', senderName: 'Diana Gupta', text: 'Looking at March 15-20. Is that good?', createdAt: '2026-02-02T09:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: '1', type: 'contact_request', referenceId: 'cr5', title: 'New Contact Request', message: 'Guest Demo wants to connect about "Luxury Penthouse Suite"', read: false, createdAt: '2026-07-28T08:00:00Z' },
  { id: 'n2', userId: '3', type: 'contact_request', referenceId: 'cr2', title: 'New Contact Request', message: 'Bob Patel wants to connect about "Modern City Loft"', read: false, createdAt: '2026-08-20T09:00:00Z' },
  { id: 'n3', userId: '1', type: 'message', referenceId: 'm4', title: 'New message from Bob Patel', message: 'Confirmed! See you in August...', read: true, createdAt: '2026-07-01T13:00:00Z' },
  { id: 'n4', userId: '2', type: 'contact_request', referenceId: 'cr4', title: 'Contact Request Update', message: 'Your request about "Seaside Villa" was declined.', read: true, createdAt: '2026-05-02T00:00:00Z' },
];

export const mockBookings: Booking[] = [
  // Bob's bookings (guestId: 2)
  { id: '1', propertyId: '1', propertyTitle: 'Seaside Villa with Private Pool', propertyPhoto: mockProperties[0].photos[0], guestId: '2', guestName: 'Bob Patel', hostId: '1', startDate: '2026-08-15', endDate: '2026-08-20', status: 'confirmed', createdAt: '2026-07-01T00:00:00Z' },
  { id: '2', propertyId: '3', propertyTitle: 'Modern City Loft', propertyPhoto: mockProperties[5].photos[0], guestId: '2', guestName: 'Bob Patel', hostId: '3', startDate: '2026-09-01', endDate: '2026-09-05', status: 'pending', createdAt: '2026-08-20T00:00:00Z' },
  { id: '3', propertyId: '2', propertyTitle: 'Cozy Mountain Cabin', propertyPhoto: mockProperties[1].photos[0], guestId: '2', guestName: 'Bob Patel', hostId: '1', startDate: '2026-07-10', endDate: '2026-07-14', status: 'declined', createdAt: '2026-06-15T00:00:00Z' },
  { id: '9', propertyId: '20', propertyTitle: 'Island Retreat in the Andamans', propertyPhoto: mockProperties[19].photos[0], guestId: '2', guestName: 'Bob Patel', hostId: '3', startDate: '2026-11-20', endDate: '2026-11-27', status: 'confirmed', createdAt: '2026-10-05T00:00:00Z' },
  { id: '10', propertyId: '14', propertyTitle: 'Tea Estate Cottage', propertyPhoto: mockProperties[13].photos[0], guestId: '2', guestName: 'Bob Patel', hostId: '6', startDate: '2026-10-05', endDate: '2026-10-08', status: 'pending', createdAt: '2026-09-25T00:00:00Z' },

  // Diana's bookings (guestId: 5)
  { id: '4', propertyId: '5', propertyTitle: 'Heritage Haveli Suite', propertyPhoto: mockProperties[2].photos[0], guestId: '5', guestName: 'Diana Gupta', hostId: '1', startDate: '2026-03-15', endDate: '2026-03-20', status: 'confirmed', createdAt: '2026-02-01T00:00:00Z' },
  { id: '5', propertyId: '7', propertyTitle: 'Luxury Penthouse Suite', propertyPhoto: mockProperties[3].photos[0], guestId: '5', guestName: 'Diana Gupta', hostId: '1', startDate: '2026-12-20', endDate: '2026-12-26', status: 'paid', createdAt: '2026-11-01T00:00:00Z' },
  { id: '11', propertyId: '11', propertyTitle: 'Colonial Bungalow with Garden', propertyPhoto: mockProperties[10].photos[0], guestId: '5', guestName: 'Diana Gupta', hostId: '6', startDate: '2026-09-15', endDate: '2026-09-18', status: 'confirmed', createdAt: '2026-08-15T00:00:00Z' },
  { id: '12', propertyId: '18', propertyTitle: 'Fort View Haveli', propertyPhoto: mockProperties[17].photos[0], guestId: '5', guestName: 'Diana Gupta', hostId: '6', startDate: '2026-08-05', endDate: '2026-08-08', status: 'declined', createdAt: '2026-07-20T00:00:00Z' },

  // Fiona's bookings (guestId: 7)
  { id: '6', propertyId: '1', propertyTitle: 'Seaside Villa with Private Pool', propertyPhoto: mockProperties[0].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '1', startDate: '2026-06-10', endDate: '2026-06-15', status: 'confirmed', createdAt: '2026-05-01T00:00:00Z' },
  { id: '7', propertyId: '5', propertyTitle: 'Heritage Haveli Suite', propertyPhoto: mockProperties[2].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '1', startDate: '2026-02-10', endDate: '2026-02-14', status: 'confirmed', createdAt: '2026-01-10T00:00:00Z' },
  { id: '8', propertyId: '4', propertyTitle: 'Beachfront Bungalow', propertyPhoto: mockProperties[6].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '3', startDate: '2026-10-10', endDate: '2026-10-14', status: 'pending', createdAt: '2026-09-20T00:00:00Z' },
  { id: '13', propertyId: '10', propertyTitle: 'Glass House in the Woods', propertyPhoto: mockProperties[9].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '6', startDate: '2026-05-01', endDate: '2026-05-04', status: 'confirmed', createdAt: '2026-04-10T00:00:00Z' },
  { id: '14', propertyId: '19', propertyTitle: 'Snowy Mountain Chalet', propertyPhoto: mockProperties[18].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '1', startDate: '2027-01-10', endDate: '2027-01-15', status: 'pending', createdAt: '2026-12-01T00:00:00Z' },
  { id: '15', propertyId: '15', propertyTitle: 'Houseboat on the Backwaters', propertyPhoto: mockProperties[14].photos[0], guestId: '7', guestName: 'Fiona Reddy', hostId: '6', startDate: '2026-08-20', endDate: '2026-08-23', status: 'confirmed', createdAt: '2026-07-25T00:00:00Z' },
];
