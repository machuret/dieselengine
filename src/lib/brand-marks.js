const asset = (name, file, colour, surface = '#ffffff') => ({
  name,
  src: `/brand/engines/${file}`,
  colour,
  surface,
});

const wordmark = (name, short, colour, surface = '#ffffff') => ({
  name,
  short,
  colour,
  surface,
});

/**
 * Local manufacturer marks used for identification on editorial pages.
 * `short` is an intentional typographic fallback for specialist, combined or
 * legacy subjects where a single current manufacturer logo would mislead.
 */
export const brandMarks = {
  'beta-marine': wordmark('Beta Marine', 'BETA', '#c62026'),
  bukh: wordmark('BUKH', 'BUKH', '#c4161c'),
  'caterpillar-marine': asset('Caterpillar Marine', 'caterpillar.svg', '#ffcd11', '#171717'),
  'craftsman-marine': wordmark('Craftsman Marine', 'CRAFTSMAN', '#f28c18'),
  'cummins-marine': asset('Cummins Marine', 'cummins.svg', '#da291c'),
  'deutz-marine': wordmark('DEUTZ Marine', 'DEUTZ', '#007b5f'),
  'doosan-marine': asset('Doosan Marine', 'doosan.svg', '#176fc1'),
  hurth: wordmark('Hurth Gearboxes', 'HURTH', '#233e66'),
  'hyundai-seasall': asset('Hyundai SeasAll', 'hyundai.svg', '#002c5f'),
  'isuzu-marine': asset('Isuzu Marine', 'isuzu.svg', '#e60012'),
  'iveco-fpt-marine': asset('Iveco / FPT Marine', 'iveco.svg', '#004b93'),
  'john-deere-marine': asset('John Deere Marine', 'john-deere.svg', '#367c2b'),
  'kubota-marine': asset('Kubota Marine Base Engines', 'kubota.svg', '#ed6b21'),
  'lombardini-kohler': asset('Lombardini / Kohler Marine', 'kohler.svg', '#202020'),
  'lugger-northern-lights': wordmark('Lugger & Northern Lights', 'NORTHERN LIGHTS', '#0d5595'),
  'man-marine': asset('MAN Marine', 'man.svg', '#202a33'),
  'marine-gensets': wordmark('Marine Generator Sets', 'MARINE GENSET', '#0d6273'),
  mercruiser: wordmark('MerCruiser & Mercury Diesel', 'MERCURY', '#d71920'),
  'mtu-detroit': wordmark('MTU & Detroit Diesel', 'MTU · DETROIT', '#004b87'),
  nanni: wordmark('Nanni Diesel', 'NANNI', '#007bb6'),
  'perkins-sabre': asset('Perkins & Sabre Marine', 'perkins.svg', '#005eb8'),
  'scania-marine': asset('Scania Marine', 'scania.svg', '#041e42'),
  'sole-diesel': wordmark('Solé Diesel', 'SOLÉ', '#e45525'),
  'steyr-motors': wordmark('Steyr Motors', 'STEYR', '#1e6b3a'),
  'twin-disc': wordmark('Twin Disc Gearboxes', 'TWIN DISC', '#d4202f'),
  vetus: wordmark('Vetus', 'VETUS', '#f4a51c', '#161616'),
  'volvo-penta': asset('Volvo Penta', 'volvo-penta.svg', '#111820'),
  'yanmar-saildrive': asset('Yanmar & Volvo Saildrives', 'yanmar.svg', '#c8102e'),
  yanmar: asset('Yanmar', 'yanmar.svg', '#c8102e'),
  'zf-marine': asset('ZF Marine Gearboxes', 'zf.svg', '#0077b5'),
};

export function brandSlug(url = '') {
  return url.replace(/\/$/, '').split('/').pop();
}

export function brandMarkFor(url) {
  return brandMarks[brandSlug(url)] ?? null;
}
