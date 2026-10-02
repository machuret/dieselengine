const profiles = {
  'inboard-sailboat': {
    label: 'Compact yacht auxiliary', group: 'Propulsion engine',
    applications: 'Displacement yachts, production cruisers and compact shaft-drive repowers',
    role: 'Low-speed manoeuvring, battery charging and auxiliary propulsion',
    priority: 'Installed dimensions, service access, charging output and local parts support',
    watch: 'Calendar-age maintenance, exhaust elbows, raw-water flow and prolonged light loading',
  },
  sailboat: {
    label: 'Compact yacht auxiliary', group: 'Propulsion engine',
    applications: 'Older sailing yachts and compact displacement craft',
    role: 'Auxiliary propulsion, normally through a shaft or small marine gearbox',
    priority: 'Parts continuity, mounting geometry, weight and service access',
    watch: 'Age, corrosion, obsolete marine-specific parts and incomplete repower records',
  },
  'sailboat-lifeboat': {
    label: 'Heavy-duty compact auxiliary', group: 'Propulsion engine',
    applications: 'Sailing yachts, rescue craft and installations valuing mechanical simplicity',
    role: 'Auxiliary or safety-focused displacement propulsion',
    priority: 'Duty approval, parts support, weight and compatibility with the existing driveline',
    watch: 'Age-related parts availability and installation-specific cooling or exhaust work',
  },
  inboard: {
    label: 'General-purpose shaft-drive inboard', group: 'Propulsion engine',
    applications: 'Displacement cruisers, workboats, older planing craft and repowers',
    role: 'Conventional propulsion through a marine gearbox and shaft',
    priority: 'Correct duty rating, gearbox ratio, propeller match and service network',
    watch: 'Marinisation parts, cooling-system condition and support for legacy variants',
  },
  'inboard-sterndrive': {
    label: 'Integrated leisure propulsion range', group: 'Propulsion system',
    applications: 'Sailing auxiliaries, shaft-drive motorboats, sterndrives and pod installations',
    role: 'A broad engine-and-drive ecosystem rather than a single engine type',
    priority: 'Identify the exact engine, drive and control generation before comparing ownership cost',
    watch: 'Proprietary diagnostics, drive servicing, haul-out intervals and electronic integration',
  },
  sterndrive: {
    label: 'High-speed sterndrive package', group: 'Propulsion system',
    applications: 'Trailerable cruisers, sports boats and compact planing craft',
    role: 'Engine and steerable drive supplied as a matched package',
    priority: 'Drive condition, corrosion history, bellows service and authorised diagnostic access',
    watch: 'Transom assemblies, cooling passages, bellows, anodes and model-specific electronics',
  },
  'commercial-planing': {
    label: 'High-output inboard', group: 'Propulsion engine',
    applications: 'Charter craft, workboats and larger planing recreational boats',
    role: 'Turbocharged propulsion across leisure and intermittent commercial duty ratings',
    priority: 'Match the published duty rating—not only maximum horsepower—to the vessel load profile',
    watch: 'Aftercoolers, fuel quality, exhaust loading and electronic fault history',
  },
  commercial: {
    label: 'Commercial-duty inboard', group: 'Propulsion engine',
    applications: 'Ferries, fishing vessels, workboats, patrol craft and displacement cruisers',
    role: 'Medium- or heavy-duty propulsion selected around annual hours and load factor',
    priority: 'Duty rating, class or survey needs, field service and through-life parts support',
    watch: 'Cooling arrangement, oil-analysis trends, load history and installation documentation',
  },
  'performance-commercial': {
    label: 'Performance and commercial inboard', group: 'Propulsion engine',
    applications: 'Large motor yachts, fast ferries, patrol craft and sportfishing boats',
    role: 'High power density where installed volume and vessel speed matter',
    priority: 'Real operating profile, service access, dealer capability and driveline limits',
    watch: 'Aftercooler service, electronic controls, thermal load and high-value component history',
  },
  'large-commercial': {
    label: 'Large-vessel propulsion', group: 'Propulsion engine',
    applications: 'Large yachts, ferries, patrol vessels and high-hour commercial craft',
    role: 'High-output or heavy-duty propulsion with engineered support requirements',
    priority: 'Classification, duty cycle, commissioning data and regional field-service capability',
    watch: 'Trend data, cooling performance, major-service history and correct rated application',
  },
  'base-engine': {
    label: 'Industrial base engine', group: 'Engine platform',
    applications: 'The core block beneath several marinised yacht auxiliaries and generator sets',
    role: 'Supplies the long motor; the mariniser supplies cooling, exhaust, mounts and controls',
    priority: 'Separate base-engine parts from brand-specific marine components before ordering',
    watch: 'Assuming an industrial manual covers the raw-water, exhaust or electrical installation',
  },
  saildrive: {
    label: 'Saildrive system', group: 'Drive system—not an engine',
    applications: 'Production sailing yachts and catamarans',
    role: 'A steerless leg combining gearbox, lower drive and propeller below the hull',
    priority: 'Match the leg to the engine, hull, propeller and manufacturer service schedule',
    watch: 'Diaphragm age, gear oil, fishing line, galvanic corrosion, seals and anode compatibility',
  },
  transmission: {
    label: 'Marine transmission', group: 'Driveline—not an engine',
    applications: 'Shaft-drive recreational and commercial vessels',
    role: 'Selects direction and reduction ratio between engine and propeller shaft',
    priority: 'Input torque, duty rating, reduction ratio, rotation and cooler arrangement',
    watch: 'Wrong oil, cable adjustment, cooler leaks, clutch wear and misdiagnosed propeller load',
  },
  'commercial-genset': {
    label: 'Propulsion and generator platform', group: 'Engine and onboard power',
    applications: 'Trawlers, workboats and marine generator sets',
    role: 'Brand family spanning propulsion engines and constant-speed auxiliary power',
    priority: 'Confirm whether the model is propulsion, auxiliary or generator-rated',
    watch: 'Light loading, cooling restriction and confusing propulsion parts with genset variants',
  },
  genset: {
    label: 'Marine generator set', group: 'Onboard power—not propulsion',
    applications: 'Cruising yachts, motor yachts and commercial vessels needing AC power',
    role: 'Constant-speed engine coupled to an alternator in a marine enclosure',
    priority: 'Continuous electrical load, 50 Hz output, cooling, sound enclosure and service access',
    watch: 'Chronic light loading, wet exhaust, blocked raw-water flow and enclosure heat',
  },
};

export const officialEngineSources = {
  'beta-marine': { title: 'Beta Marine — seagoing propulsion and saildrive range', url: 'https://betamarine.co.uk/' },
  nanni: { title: 'Nanni — current marine propulsion engine catalogue', url: 'https://nannienergy.com/products/engines/' },
  'volvo-penta': { title: 'Volvo Penta — current marine engine range', url: 'https://www.volvopenta.com/marine/all-marine-engines/' },
  yanmar: { title: 'Yanmar — current and legacy marine engine finder', url: 'https://www.yanmar.com/marine/products/engines/search-engines/' },
  'cummins-marine': { title: 'Cummins — QSB marine engine information', url: 'https://www.cummins.com/en-na/engines/products/qsb67qsb7' },
  'caterpillar-marine': { title: 'Caterpillar — C9.3 commercial propulsion engine', url: 'https://www.cat.com/en_US/products/new/power-systems/marine-power-systems/commercial-propulsion-engines/1000015283.html' },
  'john-deere-marine': { title: 'John Deere — marine engine selection guide', url: 'https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/brochures/marine-selection-guide-dswt59.pdf' },
  'man-marine': { title: 'MAN — current yacht and sport-fishing engines', url: 'https://www.man.eu/engines/en/products/marine/yacht-engines/yacht.html' },
  'scania-marine': { title: 'Scania — marine engine range', url: 'https://www.scania.com/us/en/home/products/marine-engines.html' },
};

export function engineProfileFor(segment) {
  return profiles[segment] ?? profiles.inboard;
}
