import { dark } from '@clerk/themes';
import type { Appearance } from '@clerk/shared/types';

export const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#DC2626',
    colorBackground: '#18181B',
    colorInputBackground: '#09090B',
    colorInputText: '#FAFAFA',
    colorText: '#FAFAFA',
    colorTextSecondary: '#A1A1AA',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorNeutral: '#FAFAFA',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'bg-zinc-900 border border-zinc-800 shadow-none',
    headerTitle: 'text-white',
    headerSubtitle: 'text-zinc-400',
    socialButtonsBlockButton: 'bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700',
    socialButtonsBlockButtonText: 'text-white',
    formFieldLabel: 'text-zinc-300',
    formFieldInput: 'bg-zinc-950 text-white border-zinc-700',
    footerActionText: 'text-zinc-400',
    footerActionLink: 'text-red-500',
  },
} satisfies Appearance;
