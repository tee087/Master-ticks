const venueSeatingCatalog = {
  'M&T Bank Stadium - Baltimore, MD': {
    venueName: 'M&T Bank Stadium',
    sections: [
      { name: 'Floor (Sections A–Q)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','P','Q'], seatsPerRow: 36 },
      { name: '100 Level (Sections 100–153)', type: 'lower', rowGuide: 'Rows 1–42', rows: Array.from({ length: 42 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Club (Sections 200–253)', type: 'club', rowGuide: 'Rows 1–13', rows: Array.from({ length: 13 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Suites)', type: 'suites', rowGuide: 'Suite rows', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 20 },
      { name: '400 Level (Suites)', type: 'suites', rowGuide: 'Suite rows', rows: Array.from({ length: 15 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '500 Level (Sections 500–553)', type: 'upper', rowGuide: 'Rows 1–32', rows: Array.from({ length: 32 }, (_, i) => String(i + 1)), seatsPerRow: 24 }
    ]
  },
  'AT&T Stadium - Arlington, TX': {
    venueName: 'AT&T Stadium',
    sections: [
      { name: 'Floor (Sections 1–16)', type: 'floor', rowGuide: 'Lettered rows', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: 'Event Level (EL101, EL103, EL104A, EL106, EL107, EL109, EL112, EL114, EL216, EL219, EL221, EL230, EL237, EL241, EL247, EL250, EL254, EL258)', type: 'event', rowGuide: 'Event-level rows', rows: ['EL101','EL103','EL104A','EL106','EL107','EL109','EL112','EL114','EL216','EL219','EL221','EL230','EL237','EL241','EL247','EL250','EL254','EL258'], seatsPerRow: 32 },
      { name: '100 Level (Sections 101–145)', type: 'lower', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: 'Club Sections (C107, C109, C111, C114, C115, C117, C208, C210, C211, C213, C232, C234, C235, C237, C239)', type: 'club', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Sections 220–250)', type: 'mezzanine', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 301–349)', type: 'upper', rowGuide: 'Rows 1–17', rows: Array.from({ length: 17 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 401–460)', type: 'upper', rowGuide: 'Rows 1–30', rows: Array.from({ length: 30 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: 'Standing Room / Suites', type: 'sro', rowGuide: 'Standing room and suites', rows: ['SRO','Suites'], seatsPerRow: 16 }
    ]
  },
  'Rogers Stadium - Toronto, ON, Canada': {
    venueName: 'Rogers Stadium',
    sections: [
      { name: 'Floor (Sections A1–A8, B1–B8, C1–C8, D1–D8)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A1-A8','B1-B8','C1-C8','D1-D8'], seatsPerRow: 48 },
      { name: 'West Stand (Sections 101–107)', type: 'grandstand', rowGuide: 'Rows 1–8', rows: Array.from({ length: 8 }, (_, i) => String(i + 1)), seatsPerRow: 40 },
      { name: 'North Stand (Sections 108–118)', type: 'grandstand', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: 'East Stand (Sections 119–125)', type: 'grandstand', rowGuide: 'Rows 1–7', rows: Array.from({ length: 7 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: 'South Stand (Sections 126–129)', type: 'grandstand', rowGuide: 'Rows 1–4', rows: Array.from({ length: 4 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: 'Accessible Sections (102 WCR, 107 WCR, 119 WCR, 124 WCR)', type: 'accessible', rowGuide: 'Wheelchair-accessible rows', rows: ['102 WCR','107 WCR','119 WCR','124 WCR'], seatsPerRow: 24 }
    ]
  },
  'Soldier Field - Chicago, IL': {
    venueName: 'Soldier Field',
    sections: [
      { name: 'Floor (Sections A–R)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R'], seatsPerRow: 32 },
      { name: '100 Level (Sections 101–155)', type: 'lower', rowGuide: 'Rows 1–35', rows: Array.from({ length: 35 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Club & Suites)', type: 'club', rowGuide: 'Rows 1–8', rows: Array.from({ length: 8 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 301–355)', type: 'upper', rowGuide: 'Rows 1–19', rows: Array.from({ length: 19 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 401–455)', type: 'upper', rowGuide: 'Rows 1–35', rows: Array.from({ length: 35 }, (_, i) => String(i + 1)), seatsPerRow: 24 }
    ]
  },
  'SoFi Stadium - Inglewood, CA': {
    venueName: 'SoFi Stadium',
    sections: [
      { name: 'Floor (Sections A1–A4, B1–B5, C1–C5, D1–D4)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A1-A4','B1-B5','C1-C5','D1-D4'], seatsPerRow: 36 },
      { name: '100 Level (Sections 100–124)', type: 'lower', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: 'Club Sections (C106–C110, C113–C118, C126–C137, C215–C217, C221–C223, C242–C244, C248–C250)', type: 'club', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: 'VIP Sections (VIP111–113, VIP118–120, VIP131–132, VIP219–220, VIP245–247)', type: 'vip', rowGuide: 'VIP rows', rows: ['VIP111-113','VIP118-120','VIP131-132','VIP219-220','VIP245-247'], seatsPerRow: 24 },
      { name: '200 Level (Sections 200–214, 224–240)', type: 'mezzanine', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '300 Level (Sections 300–353)', type: 'upper', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 400–457)', type: 'upper', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 20 },
      { name: '500 Level (Sections 504–553)', type: 'upper', rowGuide: 'Rows 1–28', rows: Array.from({ length: 28 }, (_, i) => String(i + 1)), seatsPerRow: 18 }
    ]
  }
};

export const resolveSeatingConfig = (event) => {
  const normalizedVenue = event?.venue || '';
  const catalogConfig = venueSeatingCatalog[normalizedVenue];

  if (catalogConfig) {
    return catalogConfig;
  }

  const eventSeatingConfig = event?.seatingConfig;

  if (eventSeatingConfig && Array.isArray(eventSeatingConfig.sections) && eventSeatingConfig.sections.length > 0) {
    return eventSeatingConfig;
  }

  return { sections: [] };
};
