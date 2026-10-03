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
      { name: 'Floor (Sections)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A1','A2','A3','A4','A5','A6','A7','A8','B1','B2','B3','B4','B5','B6','B7','B8','C1','C2','C3','C4','C5','C6','C7','C8','D1','D2','D3','D4','D5','D6','D7','D8'], seatsPerRow: 48 },
      { name: 'Sections 101–129', type: 'lower', rowGuide: 'Rows 1–10', rows: Array.from({ length: 29 }, (_, i) => String(101 + i)), seatsPerRow: 36 },
      { name: 'Accessible Sections', type: 'accessible', rowGuide: 'Wheelchair-accessible rows', rows: ['102 WCR','107 WCR','119 WCR','124 WCR'], seatsPerRow: 24 }
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
  },
  'Sphere': {
    venueName: 'Sphere',
    sections: [
      { name: 'Floor (Sections 1–16)', type: 'floor', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: '100 Level (Sections 100–141)', type: 'lower', rowGuide: 'Rows 1–30', rows: Array.from({ length: 30 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Sections 200–242)', type: 'mezzanine', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 300–342)', type: 'upper', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 24 }
    ]
  },
  'Allegiant Stadium - Paradise, NV': {
    venueName: 'Allegiant Stadium',
    sections: [
      { name: 'Club Floor (Sections 1–25)', type: 'floor', rowGuide: 'Lettered rows A–Z', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'], seatsPerRow: 42 },
      { name: '100 Level (Sections 100–144)', type: 'lower', rowGuide: 'Rows 1–26', rows: Array.from({ length: 26 }, (_, i) => String(i + 1)), seatsPerRow: 38 },
      { name: '200 Level Club (Sections 200–244)', type: 'club', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 34 },
      { name: '300 Level (Sections 300–344)', type: 'upper', rowGuide: 'Rows 1–35', rows: Array.from({ length: 35 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '400 Level Suite Level (Sections 400–446)', type: 'suites', rowGuide: 'Suite rows', rows: Array.from({ length: 18 }, (_, i) => `S${i + 1}`), seatsPerRow: 22 }
    ]
  },
  'Gillette Stadium - Foxborough, MA': {
    venueName: 'Gillette Stadium',
    sections: [
      { name: 'Field Level (Sections 1–120)', type: 'floor', rowGuide: 'Rows 1–15', rows: Array.from({ length: 15 }, (_, i) => String(i + 1)), seatsPerRow: 30 },
      { name: '100 Level (Sections 100–156)', type: 'lower', rowGuide: 'Rows 1–42', rows: Array.from({ length: 42 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Sections 200–256)', type: 'club', rowGuide: 'Rows 1–13', rows: Array.from({ length: 13 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 300–356)', type: 'upper', rowGuide: 'Rows 1–30', rows: Array.from({ length: 30 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 400–500)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 20 }
    ]
  },
  'MetLife Stadium - East Rutherford, NJ': {
    venueName: 'MetLife Stadium',
    sections: [
      { name: 'Club Level (Sections 1–108)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'], seatsPerRow: 36 },
      { name: '100 Level (Sections 101–145)', type: 'lower', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 34 },
      { name: '200 Level (Sections 201–244)', type: 'club', rowGuide: 'Rows 1–15', rows: Array.from({ length: 15 }, (_, i) => String(i + 1)), seatsPerRow: 30 },
      { name: '300 Level (Sections 301–343)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '400 Level (Sections 401–437)', type: 'upper', rowGuide: 'Rows 1–28', rows: Array.from({ length: 28 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '500 Level (Sections 501–530)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 22 }
    ]
  },
  'Barclays Center - Brooklyn, NY': {
    venueName: 'Barclays Center',
    sections: [
      { name: 'Floor (Courtside Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','P','Q'], seatsPerRow: 22 },
      { name: '100 Level (Sections 100–130)', type: 'lower', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–230)', type: 'mezzanine', rowGuide: 'Rows 1–15', rows: Array.from({ length: 15 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–320)', type: 'upper', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Chase Center - San Francisco, CA': {
    venueName: 'Chase Center',
    sections: [
      { name: 'Courtside (Sections 1–20)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–315)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Ball Arena - Denver, CO': {
    venueName: 'Ball Arena',
    sections: [
      { name: 'Floor (Sections 1–36)', type: 'floor', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 22 },
      { name: '100 Level (Sections 100–130)', type: 'lower', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 20 },
      { name: '200 Level (Sections 200–230)', type: 'mezzanine', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '300 Level (Sections 300–320)', type: 'upper', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 16 }
    ]
  },
  'Frost Bank Center - San Antonio, TX': {
    venueName: 'Frost Bank Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–215)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–310)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  "Levi's Stadium - Santa Clara, CA": {
    venueName: "Levi's Stadium",
    sections: [
      { name: 'Field Level (Sections 1–40)', type: 'floor', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 42 },
      { name: '100 Level (Sections 100–152)', type: 'lower', rowGuide: 'Rows 1–32', rows: Array.from({ length: 32 }, (_, i) => String(i + 1)), seatsPerRow: 38 },
      { name: '200 Level (Sections 200–252)', type: 'club', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '300 Level (Sections 300–348)', type: 'upper', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 26 },
      { name: '400 Level (Sections 400–445)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 22 }
    ]
  },
  'Madison Square Garden - New York, NY': {
    venueName: 'Madison Square Garden',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','N','P'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–124)', type: 'lower', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–330)', type: 'upper', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 14 },
      { name: '400 Level (Sections 400–416)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 12 }
    ]
  },
  'Yankee Stadium - Bronx, NY': {
    venueName: 'Yankee Stadium',
    sections: [
      { name: 'Field Level (Sections 1–40)', type: 'floor', rowGuide: 'Rows 1–41', rows: Array.from({ length: 41 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '100 Level (Sections 100–130)', type: 'lower', rowGuide: 'Rows 1–31', rows: Array.from({ length: 31 }, (_, i) => String(i + 1)), seatsPerRow: 14 },
      { name: '200 Level (Sections 200–232)', type: 'club', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 12 },
      { name: '300 Level (Sections 300–343)', type: 'mezzanine', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 12 },
      { name: '400 Level (Sections 400–443)', type: 'upper', rowGuide: 'Rows 1–28', rows: Array.from({ length: 28 }, (_, i) => String(i + 1)), seatsPerRow: 10 }
    ]
  },
  'Bank of America Stadium - Charlotte, NC': {
    venueName: 'Bank of America Stadium',
    sections: [
      { name: 'Field Level (Sections 1–32)', type: 'floor', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 44 },
      { name: '100 Level (Sections 100–140)', type: 'lower', rowGuide: 'Rows 1–34', rows: Array.from({ length: 34 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: '200 Level (Sections 200–242)', type: 'club', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '300 Level (Sections 300–344)', type: 'upper', rowGuide: 'Rows 1–30', rows: Array.from({ length: 30 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '400 Level (Sections 400–434)', type: 'upper', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 24 }
    ]
  },
  'Fiserv Forum - Milwaukee, WI': {
    venueName: 'Fiserv Forum',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–215)', type: 'mezzanine', rowGuide: 'Rows 1–13', rows: Array.from({ length: 13 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–310)', type: 'upper', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'FedExForum - Memphis, TN': {
    venueName: 'FedExForum',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–310)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Paycom Center - Oklahoma City, OK': {
    venueName: 'Paycom Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Capital One Arena - Washington, DC': {
    venueName: 'Capital One Arena',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–124)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–316)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Prudential Center - Newark, NJ': {
    venueName: 'Prudential Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–310)', type: 'upper', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Bridgestone Arena - Nashville, TN': {
    venueName: 'Bridgestone Arena',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–122)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–314)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Golden 1 Center - Sacramento, CA': {
    venueName: 'Golden 1 Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–310)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Moda Center - Portland, OR': {
    venueName: 'Moda Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Kia Center - Orlando, FL': {
    venueName: 'Kia Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–218)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–314)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'State Farm Arena - Atlanta, GA': {
    venueName: 'State Farm Arena',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–122)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–314)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'PPG Paints Arena - Pittsburgh, PA': {
    venueName: 'PPG Paints Arena',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–216)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Kaseya Center - Miami, FL': {
    venueName: 'Kaseya Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–218)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Gainbridge Fieldhouse - Indianapolis, IN': {
    venueName: 'Gainbridge Fieldhouse',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–220)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  'Allstate Arena - Rosemont, IL': {
    venueName: 'Allstate Arena',
    sections: [
      { name: 'Floor (Sections 1–30)', type: 'floor', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: '100 Level (Sections 100–130)', type: 'lower', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Sections 200–224)', type: 'mezzanine', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 300–320)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 24 }
    ]
  },
  'First Horizon Coliseum - Greenville, NC': {
    venueName: 'First Horizon Coliseum',
    sections: [
      { name: 'Floor (Sections 1–26)', type: 'floor', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '200 Level (Sections 200–214)', type: 'mezzanine', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '300 Level (Sections 300–308)', type: 'upper', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 20 }
    ]
  },
  'Tropicana Field - St. Petersburg, FL': {
    venueName: 'Tropicana Field',
    sections: [
      { name: 'Field Level (Sections 1–50)', type: 'floor', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 36 },
      { name: '100 Level (Sections 100–148)', type: 'lower', rowGuide: 'Rows 1–26', rows: Array.from({ length: 26 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '200 Level (Sections 200–265)', type: 'club', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 28 },
      { name: '300 Level (Sections 300–380)', type: 'upper', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 400–490)', type: 'upper', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 20 }
    ]
  },
  'Spectrum Center - Charlotte, NC': {
    venueName: 'Spectrum Center',
    sections: [
      { name: 'Courtside (Sections 1–24)', type: 'floor', rowGuide: 'Lettered rows', rows: ['A','B','C','D','E','F','G','H','J','K','L','M'], seatsPerRow: 20 },
      { name: '100 Level (Sections 100–120)', type: 'lower', rowGuide: 'Rows 1–14', rows: Array.from({ length: 14 }, (_, i) => String(i + 1)), seatsPerRow: 18 },
      { name: '200 Level (Sections 200–216)', type: 'mezzanine', rowGuide: 'Rows 1–12', rows: Array.from({ length: 12 }, (_, i) => String(i + 1)), seatsPerRow: 16 },
      { name: '300 Level (Sections 300–312)', type: 'upper', rowGuide: 'Rows 1–10', rows: Array.from({ length: 10 }, (_, i) => String(i + 1)), seatsPerRow: 14 }
    ]
  },
  "Levi's Stadium - Santa Clara, CA": {
    venueName: "Levi's Stadium",
    sections: [
      { name: 'Field Level (Sections 1–40)', type: 'floor', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 42 },
      { name: '100 Level (Sections 100–152)', type: 'lower', rowGuide: 'Rows 1–32', rows: Array.from({ length: 32 }, (_, i) => String(i + 1)), seatsPerRow: 38 },
      { name: '200 Level (Sections 200–252)', type: 'club', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '300 Level (Sections 300–348)', type: 'upper', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 26 },
      { name: '400 Level (Sections 400–445)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 22 }
    ]
  },
  'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV': {
    venueName: 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX',
    sections: [
      { name: 'Pit Straight (Turn 1 grandstand)', type: 'floor', rowGuide: 'Rows A–Z', rows: ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'], seatsPerRow: 40 },
      { name: 'T2 Grandstand', type: 'lower', rowGuide: 'Rows 1–30', rows: Array.from({ length: 30 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: 'T3 Grandstand', type: 'lower', rowGuide: 'Rows 1–28', rows: Array.from({ length: 28 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: 'T15 Grandstand', type: 'upper', rowGuide: 'Rows 1–22', rows: Array.from({ length: 22 }, (_, i) => String(i + 1)), seatsPerRow: 20 },
      { name: 'T16 Grandstand', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 18 }
    ]
  },
  'Reliant Stadium - Houston, TX': {
    venueName: 'Reliant Stadium',
    sections: [
      { name: 'Club Level (Sections 100–132)', type: 'club', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 34 },
      { name: '100 Level (Sections 101–140)', type: 'lower', rowGuide: 'Rows 1–34', rows: Array.from({ length: 34 }, (_, i) => String(i + 1)), seatsPerRow: 38 },
      { name: '200 Level (Sections 200–250)', type: 'mezzanine', rowGuide: 'Rows 1–28', rows: Array.from({ length: 28 }, (_, i) => String(i + 1)), seatsPerRow: 30 },
      { name: '300 Level (Sections 300–360)', type: 'upper', rowGuide: 'Rows 1–32', rows: Array.from({ length: 32 }, (_, i) => String(i + 1)), seatsPerRow: 24 },
      { name: '400 Level (Sections 400–450)', type: 'upper', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 20 }
   ],
  },
  "Levi's Stadium - Santa Clara, CA": {
    venueName: "Levi's Stadium",
    sections: [
      { name: 'Field Level (Sections 1–40)', type: 'floor', rowGuide: 'Rows 1–18', rows: Array.from({ length: 18 }, (_, i) => String(i + 1)), seatsPerRow: 42 },
      { name: '100 Level (Sections 100–152)', type: 'lower', rowGuide: 'Rows 1–32', rows: Array.from({ length: 32 }, (_, i) => String(i + 1)), seatsPerRow: 38 },
      { name: '200 Level (Sections 200–252)', type: 'club', rowGuide: 'Rows 1–16', rows: Array.from({ length: 16 }, (_, i) => String(i + 1)), seatsPerRow: 32 },
      { name: '300 Level (Sections 300–348)', type: 'upper', rowGuide: 'Rows 1–24', rows: Array.from({ length: 24 }, (_, i) => String(i + 1)), seatsPerRow: 26 },
      { name: '400 Level (Sections 400–445)', type: 'upper', rowGuide: 'Rows 1–20', rows: Array.from({ length: 20 }, (_, i) => String(i + 1)), seatsPerRow: 22 }
    ]
  }
};

const _venueAlias = {
  'Allegiant Stadium': 'Allegiant Stadium - Paradise, NV',
  'Gillette Stadium': 'Gillette Stadium - Foxborough, MA',
  'MetLife Stadium': 'MetLife Stadium - East Rutherford, NJ',
  'Barclays Center': 'Barclays Center - Brooklyn, NY',
  'Chase Center': 'Chase Center - San Francisco, CA',
  'Ball Arena': 'Ball Arena - Denver, CO',
  'Frost Bank Center': 'Frost Bank Center - San Antonio, TX',
  'Madison Square Garden': 'Madison Square Garden - New York, NY',
  'Yankee Stadium': 'Yankee Stadium - Bronx, NY',
  'Bank of America Stadium': 'Bank of America Stadium - Charlotte, NC',
  'Fiserv Forum': 'Fiserv Forum - Milwaukee, WI',
  'Federal Reserve': 'Federal Reserve - Cleveland, OH',
  'Paycom Center': 'Paycom Center - Oklahoma City, OK',
  'Capital One Arena': 'Capital One Arena - Washington, DC',
  'Prudential Center': 'Prudential Center - Newark, NJ',
  'Bridgestone Arena': 'Bridgestone Arena - Nashville, TN',
  'PPG Paints Arena': 'PPG Paints Arena - Pittsburgh, PA',
  'Kaseya Center': 'Kaseya Center - Miami, FL',
  'State Farm Arena': 'State Farm Arena - Atlanta, GA',
  'Golden 1 Center': 'Golden 1 Center - Sacramento, CA',
  'Moda Center': 'Moda Center - Portland, OR',
  'Kia Center': 'Kia Center - Orlando, FL',
  'Spectrum Center': 'Spectrum Center - Charlotte, NC',
   'Tropicana Field': 'Tropicana Field - St. Petersburg, FL',
   'Reliant Stadium': 'Reliant Stadium - Houston, TX',
   "Levi's Stadium": "Levi's Stadium - Santa Clara, CA",
   "Levi's\u00ae Stadium": "Levi's Stadium - Santa Clara, CA",
   'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'Flamingo Zone': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'Koval Zone by Heineken': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'East Harmon Zone': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'West Harmon Zone': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'Grand Prix Plaza Zone': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'Club Paris Hospitality': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'T-Mobile Zone at Sphere': 'FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX - Las Vegas, NV',
   'Mortgage Matchup Center': 'Madison Square Garden - New York, NY',
};

const _venueKey = (rawVenue) => {
  if (!rawVenue) return '';
  if (venueSeatingCatalog[rawVenue]) return rawVenue;
  if (_venueAlias[rawVenue]) return _venueAlias[rawVenue];
  // Try matching a catalog entry whose venueName prefix equals the raw name.
  for (const k of Object.keys(venueSeatingCatalog)) {
    if (venueSeatingCatalog[k].venueName === rawVenue) return k;
  }
  // Fallback: accept a "Name - City" form as-is (catalog key).
  return rawVenue;
};

export const resolveSeatingConfig = (event) => {
  const normalizedVenue = _venueKey(event?.venue || '');
  const catalogConfig = venueSeatingCatalog[normalizedVenue];

  if (catalogConfig) {
    return catalogConfig;
  }

  const eventSeatingConfig = event?.seatingConfig;

  if (eventSeatingConfig && Array.isArray(eventSeatingConfig.sections) && eventSeatingConfig.sections.length > 0) {
    return eventSeatingConfig;
  }

  const byVenue = Object.values(venueSeatingCatalog).find((c) => c.venueName === normalizedVenue);
  return byVenue || { sections: [] };
};
