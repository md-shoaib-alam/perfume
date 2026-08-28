// Location Data & Fallback Maps for Account View & Address Forms

export const COUNTRY_STATE_CITY_MAP: Record<string, Record<string, string[]>> = {
  'India': {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Aalo', 'Tezu', 'Roing'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi'],
    'Chandigarh': ['Chandigarh'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Raigarh', 'Mahasamund'],
    'Delhi': ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Connaught Place', 'Saket', 'Vasant Kunj'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Cuncolim', 'Canacona'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra', 'Patan'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Sirsa', 'Bhiwani', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Hansi'],
    'Himachal Pradesh': [
      'Arki', 'Baddi', 'Banjar', 'Bilaspur', 'Chamba', 'Chaupal', 'Chowari', 'Chuari Khas',
      'Dagshai', 'Dalhousie', 'Daulatpur', 'Dera Gopipur', 'Dharamsala', 'Gagret', 'Ghumarwin',
      'Hamirpur', 'Jawala Mukhi', 'Jogindarnagar', 'Jubbal', 'Kasauli', 'Kullu', 'Manali',
      'Mandi', 'Nahan', 'Nalagarh', 'Palampur', 'Paonta Sahib', 'Rohru', 'Shimla', 'Solan',
      'Sundarnagar', 'Una'
    ],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Sopore', 'Punch', 'Rajouri', 'Kupwara'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar', 'Hosapete', 'Gadag-Betageri', 'Robertsonpet', 'Hassan', 'Bhadravati', 'Chitradurga', 'Udupi', 'Kolar'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kottayam', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'],
    'Ladakh': ['Leh', 'Kargil'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi-Nizampur', 'Amravati', 'Nanded-Waghala', 'Kolhapur', 'Ulhasnagar', 'Sangli-Miraj & Kupwad', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed', 'Gondia', 'Satara', 'Barshi', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar', 'Baghmara', 'Resubelpara'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Saitual'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore'],
    'Puducherry': ['Puducherry', 'Ozhukarai', 'Karaikal', 'Mahe', 'Yanam'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Muktsar', 'Barnala', 'Firozpur', 'Kapurthala'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dhaulpur', 'Tonk', 'Beawar', 'Hanumangarh'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Singtam', 'Rangpo', 'Jorethang'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam', 'Viluppuram', 'Dindigul', 'Cuddalore', 'Kumbakonam'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet', 'Jagtial'],
    'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Teliamura', 'Khowai', 'Belonia', 'Ambassa'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani-cum-Kathgodam', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Ramnagar', 'Manglaur', 'Jaspur', 'Kichha', 'Nainital'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Maheshtala', 'Rajpur Sonarpur', 'South Dumdum', 'Gopalpur', 'Bhatpara', 'Panihati', 'Kamarhati', 'Bardhaman', 'Kulti', 'Bally', 'Barasat', 'North Dumdum', 'Baranagar', 'Uluberia', 'Naihati', 'Bidhan Nagar', 'Kharagpur', 'Haldia', 'Madhyamgram', 'Habra', 'Berhampore', 'Santipur', 'Basirhat', 'Bankura', 'Malda']
  },
  'United Arab Emirates': {
    'Dubai': ['Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 'Deira', 'Bur Dubai', 'Palm Jumeirah', 'Al Barsha', 'Mirdif', 'Al Quoz'],
    'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Yas Island', 'Saadiyat Island', 'Khalifa City', 'Musaffah'],
    'Sharjah': ['Sharjah City', 'Khor Fakkan', 'Kalba', 'Al Dhaid', 'Al Madam'],
    'Ajman': ['Ajman City', 'Masfout', 'Manama'],
    'Ras Al Khaimah': ['Ras Al Khaimah City', 'Al Hamra Village', 'Al Jazirah Al Hamra', 'Mina Al Arab'],
    'Fujairah': ['Fujairah City', 'Dibba Al-Fujairah', 'Al Bidya'],
    'Umm Al Quwain': ['Umm Al Quwain City', 'Al Salamah', 'Falaj Al Mualla']
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Newcastle', 'Bristol', 'Sheffield', 'Nottingham', 'Leicester', 'Southampton', 'Oxford', 'Cambridge', 'Brighton'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Perth'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Bangor', 'St Asaph', 'St Davids'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh']
  },
  'United States': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady'],
    'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Cape Coral'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett']
  },
  'Saudi Arabia': {
    'Riyadh Region': ['Riyadh', 'Al Kharj', 'Ad Diriyah', 'Al Majma\'ah', 'Ad Dawadimi'],
    'Makkah Region': ['Jeddah', 'Mecca', 'Taif', 'Rabigh', 'Al Qunfudhah'],
    'Eastern Province': ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Al Ahsa', 'Qatif', 'Hafar Al Batin'],
    'Medina Region': ['Medina', 'Yanbu', 'Badr', 'Al Ula']
  },
  'Singapore': {
    'Singapore': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region', 'Orchard', 'Marina Bay', 'Changi', 'Jurong']
  },
  'Qatar': {
    'Doha': ['Doha', 'West Bay', 'The Pearl', 'Lusail', 'Al Sadd'],
    'Al Rayyan': ['Al Rayyan City', 'Education City', 'Al Wajbah'],
    'Al Wakrah': ['Al Wakrah City', 'Mesaieed'],
    'Al Khor': ['Al Khor City', 'Ras Laffan']
  },
  'Kuwait': {
    'Al Asimah (Capital)': ['Kuwait City', 'Sharq', 'Mirgab', 'Dasman', 'Salhiya'],
    'Hawalli': ['Hawalli', 'Salmiya', 'Rumaithiya', 'Bayan', 'Mishref'],
    'Farwaniya': ['Farwaniya', 'Khaitan', 'Jleeb Al-Shuyoukh', 'Andalous', 'Rabiya'],
    'Ahmadi': ['Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula', 'Egaila']
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'],
    'British Columbia': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna', 'Abbotsford'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat']
  },
  'Australia': {
    'New South Wales': ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong', 'Maitland', 'Tweed Heads'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba'],
    'Western Australia': ['Perth', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge']
  }
};

export const ALL_GLOBAL_COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Saudi Arabia',
  'Singapore',
  'Qatar',
  'Kuwait',
  'Canada',
  'Australia',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Samoa', 'San Marino', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Uganda', 'Ukraine', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

export const COUNTRIES = ALL_GLOBAL_COUNTRIES;
export const RELATIONSHIPS = ['Self', 'Family', 'Friend', 'Colleague', 'Other'];

// Normalize accented characters (e.g. Nālanda -> Nalanda, Mothīhāri -> Motihari)
export const normalizeLocationName = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};
