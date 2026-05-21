-- Seed Surat localities and sample news

INSERT INTO localities (district, taluka, area_name, area_name_gu, sort_order) VALUES
  ('Surat', 'Surat City', 'Adajan', 'અડાજણ', 1),
  ('Surat', 'Surat City', 'Vesu', 'વેસુ', 2),
  ('Surat', 'Surat City', 'Pal', 'પાલ', 3),
  ('Surat', 'Surat City', 'Piplod', 'પીપલોદ', 4),
  ('Surat', 'Surat City', 'Athwa', 'અથવા', 5),
  ('Surat', 'Surat City', 'City Light', 'સિટી લાઇટ', 6),
  ('Surat', 'Surat City', 'Katargam', 'કતારગામ', 7),
  ('Surat', 'Surat City', 'Varachha', 'વરાછા', 8),
  ('Surat', 'Surat City', 'Udhna', 'ઉધના', 9),
  ('Surat', 'Surat City', 'Sachin', 'સાચિન', 10),
  ('Surat', 'Surat City', 'Dumas', 'દુમસ', 11),
  ('Surat', 'Surat City', 'Althan', 'અલ્થણ', 12),
  ('Surat', 'Surat City', 'Bhestan', 'ભેસ્તાન', 13),
  ('Surat', 'Surat City', 'Rander', 'રાંદેર', 14),
  ('Surat', 'Surat City', 'Olpad', 'ઓલપાડ', 15),
  ('Surat', 'Choryasi', 'Palsana', 'પલસાણા', 20),
  ('Surat', 'Choryasi', 'Kamrej', 'કામરેજ', 21),
  ('Surat', 'Choryasi', 'Kim', 'કીમ', 22),
  ('Surat', 'Choryasi', 'Hazira', 'હઝીરા', 23),
  ('Surat', 'Kamrej', 'Bardoli Road', 'બારડોલી રોડ', 30),
  ('Surat', 'Majura', 'Magdalla', 'મગડલ્લા', 40),
  ('Surat', 'Olpad', 'Sayli', 'સાયલી', 50),
  ('Surat', 'Olpad', 'Baben', 'બાબેન', 51);

INSERT INTO news_items (title, title_gu, summary, summary_gu, category, source_url, published_at, is_published) VALUES
  (
    'SUDA publishes updated Town Planning schemes for Surat region',
    'સુરત પ્રદેશ માટે સુડાના અપડેટેડ ટાઉન પ્લાનિંગ સ્કીમ',
    'Surat Urban Development Authority (SUDA) has notified revised TP sheets for select zones. Property buyers should verify the latest TP number and FSI with official SUDA publications before purchase.',
    'સુરત શહેરી વિકાસ સત્તા (સુડા) દ્વારા પસંદગીના ઝોન માટે સુધારેલ TP શીટ જાહેર કરવામાં આવી છે. ખરીદી પહેલાં અધિકૃત સુડા પ્રકાશનથી TP નંબર અને FSI ચકાસો.',
    'suda',
    'https://www.sudaonline.org',
    NOW() - INTERVAL '2 days',
    true
  ),
  (
    'RERA Gujarat: verify project registration before booking',
    'રેરા ગુજરાત: બુકિંગ પહેલાં પ્રોજેક્ટ નોંધણી ચકાસો',
    'All new residential and commercial projects in Gujarat must be registered with GUJRERA. Buyers in Surat should check RERA registration number, carpet area, and escrow account details on the official portal.',
    'ગુજરાતના તમામ નવા રહેણાંક અને વ્યાપારી પ્રોજેક્ટ GUJRERA સાથે નોંધાયેલા હોવા જોઈએ. સુરતના ખરીદદારોએ અધિકૃત પોર્ટલ પર RERA નંબર, કાર્પેટ એરિયા અને એસ્ક્રો ખાતા ચકાસો.',
    'rera',
    'https://gujrera.gujarat.gov.in',
    NOW() - INTERVAL '5 days',
    true
  ),
  (
    'Revenue department circular on 7/12 and property card access',
    '7/12 અને પ્રોપર્ટી કાર્ડ ઍક્સેસ પર રેવન્યુ વિભાગની પરિપત્ર',
    'Land records including 7/12 and property cards for Surat district villages are available through i-ORA / AnyROR Gujarat portals. Always cross-check survey numbers with the latest village map.',
    'સુરત જિલ્લાના ગામો માટે 7/12 અને પ્રોપર્ટી કાર્ડ i-ORA / AnyROR ગુજરાત પોર્ટલ પર ઉપલબ્ધ છે. નવીનતમ ગ્રામ નકશા સાથે સર્વે નંબર ચકાસો.',
    'revenue',
    'https://anyror.gujarat.gov.in',
    NOW() - INTERVAL '7 days',
    true
  ),
  (
    'Surat Metro Phase updates: alignment impact on adjoining plots',
    'સુરત મેટ્રો ફેઝ અપડેટ: સંલગ્ન પ્લોટ પર અસર',
    'Metro corridor planning may affect land use along major corridors in Surat city. Investors should review SMC and SUDA notices for alignment changes near Vesu, Adajan, and Varachha corridors.',
    'મેટ્રો કોરિડોર પ્લાનિંગ સુરત શહેરની મુખ્ય ધારાઓ પર લેન્ડ યુઝને અસર કરી શકે છે. વેસુ, અડાજણ અને વરાછા કોરિડોર નજીક SMC અને સુડા નોટિસ ચકાસો.',
    'infrastructure',
    'https://www.suratmunicipal.gov.in',
    NOW() - INTERVAL '10 days',
    true
  ),
  (
    'Stamp duty and registration fee guidelines for Surat district',
    'સુરત જિલ્લા માટે સ્ટામ્પ ડ્યુટી અને નોંધણી ફી માર્ગદર્શન',
    'Registration charges for sale deeds in Gujarat vary by property type and location. Consult the latest GR and sub-registrar office schedule for Surat before finalizing transactions.',
    'ગુજરાતમાં વેચાણ દસ્તાવેજ માટે નોંધણી ચાર્જિસ પ્રોપર્ટી પ્રકાર અને સ્થાન અનુસાર બદલાય છે. વ્યવહાર પૂર્ણ કરતા પહેલાં સુરત માટે નવીનતમ GR અને સબ-રજિસ્ટ્રાર શેડ્યૂલ જુઓ.',
    'gst_registration',
    'https://igrs.gujarat.gov.in',
    NOW() - INTERVAL '12 days',
    true
  ),
  (
    'SMC Development Plan (DP) maps available for public reference',
    'SMC ડેવલપમેન્ટ પ્લાન (DP) નકશા જાહેર સંદર્ભ માટે',
    'Surat Municipal Corporation publishes DP maps showing zoning, roads, and amenities. Use official SMC sources; third-party overlays are indicative only.',
    'સુરત મ્યુનિસિપલ કોર્પોરેશન DP નકશા ઝોનિંગ, રસ્તા અને સુવિધાઓ દર્શાવે છે. અધિકૃત SMC સ્ત્રોતો વાપરો; તૃતીય પક્ષ ઓવરલે માત્ર સંકેતક છે.',
    'suda',
    'https://www.suratmunicipal.gov.in',
    NOW() - INTERVAL '14 days',
    true
  ),
  (
    'Agricultural land NA conversion process in Surat talukas',
    'સુરત તાલુકામાં કૃષિ જમીન NA રૂપાંતર પ્રક્રિયા',
    'Non-agricultural (NA) permission is required before developing agricultural plots. The process involves district collector and relevant urban bodies depending on location (city limit vs gram panchayat).',
    'કૃષિ પ્લોટ વિકસાવતા પહેલાં NA પરવાનગી જરૂરી છે. સ્થાન અનુસાર (શહેર મર્યાદા વિ ગ્રામ પંચાયત) જિલ્લા કલેક્ટર અને સંબંધિત સંસ્થાઓ સામેલ છે.',
    'revenue',
    NULL,
    NOW() - INTERVAL '18 days',
    true
  ),
  (
    'Jantri rates reference for Surat district property valuation',
    'સુરત જિલ્લા પ્રોપર્ટી મૂલ્યાંકન માટે જંત્રી દર સંદર્ભ',
    'Government jantri rates are used as a baseline for stamp duty calculations. Rates differ by zone and property class; verify the latest notification for your survey block.',
    'સરકારી જંત્રી દર સ્ટામ્પ ડ્યુટી ગણતરી માટે આધારરેખા છે. ઝોન અને પ્રોપર્ટી વર્ગ અનુસાર દર બદલાય છે; તમારા સર્વે બ્લોક માટે નવીનતમ નોટિફિકેશન ચકાસો.',
    'revenue',
    'https://revenuedepartment.gujarat.gov.in',
    NOW() - INTERVAL '20 days',
    true
  ),
  (
    'Ring Road and BRTS expansion: infrastructure notices',
    'રિંગ રોડ અને BRTS વિસ્તરણ: ઇન્ફ્રાસ્ટ્રક્ચર નોટિસ',
    'New road widening and BRTS corridor projects may trigger land acquisition or TDR policies. Monitor official SMC and state PWD announcements for Surat.',
    'નવા રોડ વિસ્તરણ અને BRTS કોરિડોર પ્રોજેક્ટ જમીન અિગ્રહણ અથવા TDR નીતિઓ લાવી શકે છે. સુરત માટે અધિકૃત SMC અને રાજ્ય PWD જાહેરાતો ફોલો કરો.',
    'infrastructure',
    NULL,
    NOW() - INTERVAL '22 days',
    true
  ),
  (
    'Gift City and Dholera impact on Surat peripheral land demand',
    'ગિફ્ટ સિટી અને ધોલેરાનો સુરત પરિધિ જમીન માંગ પર પ્રભાવ',
    'Infrastructure corridors toward Hazira, Palsana, and Kamrej continue to attract investor interest. Due diligence on zoning and title is essential.',
    'હઝીરા, પલસાણા અને કામરેજ તરફ ઇન્ફ્રાસ્ટ્રક્ચર કોરિડોર રોકાણકારોનું ધ્યાન ખેંચે છે. ઝોનિંગ અને ટાઇટલ પર યોગ્ય તપાસ જરૂરી છે.',
    'general',
    NULL,
    NOW() - INTERVAL '25 days',
    true
  ),
  (
    'TP scheme for Dindoli and Udhna industrial belt updates',
    'દિંડોલી અને ઉધના ઔદ્યોગિક બેલ્ટ TP સ્કીમ અપડેટ',
    'Industrial and warehouse demand near Udhna-Dindoli remains strong. Confirm industrial zoning and environmental clearance requirements with SUDA TP sheets.',
    'ઉધના-દિંડોલી નજીક ઔદ્યોગિક અને વેરહાઉસ માંગ મજબૂત છે. સુડા TP શીટ સાથે ઔદ્યોગિક ઝોનિંગ અને પર્યાવરણ મંજૂરી ચકાસો.',
    'suda',
    'https://www.sudaonline.org',
    NOW() - INTERVAL '28 days',
    true
  ),
  (
    'Real estate agents must display RERA registration in Gujarat',
    'ગુજરાતમાં રિયલ એસ્ટેટ એજન્ટોએ RERA નોંધણી દર્શાવવી જોઈએ',
    'Registered agents and brokers promoting projects in Surat should display valid RERA agent registration. Consumers can verify credentials on GUJRERA portal.',
    'સુરતમાં પ્રોજેક્ટ પ્રમોટ કરતા નોંધાયેલા એજન્ટોએ માન્ય RERA એજન્ટ નોંધણી દર્શાવવી જોઈએ. ગ્રાહકો GUJRERA પોર્ટલ પર ચકાસી શકે છે.',
    'rera',
    'https://gujrera.gujarat.gov.in',
    NOW() - INTERVAL '30 days',
    true
  );
