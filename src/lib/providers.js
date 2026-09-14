import snapshot from '../../data/yousail-providers.json' with { type: 'json' };

export const providers = [...snapshot.businesses].sort((a, b) => a.name.localeCompare(b.name, 'en-AU'));

export function providerLocation(provider) {
  return [provider.suburb, provider.state, provider.postcode].filter(Boolean).join(', ');
}
