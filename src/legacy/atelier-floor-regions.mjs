import {COUTURE_FLOORS} from './couture-floor-regions.mjs';
// Small visible floor samples only; never paint furniture or textile rugs.
const shared={
 living:{areas:[[[.02,.98],[.03,.93],[.12,.86],[.14,.88],[.09,.99]]]},
 dining:{areas:[[[.04,.96],[.92,.96],[.94,.995],[.04,.995]]]},
 master:{areas:[[[.11,.98],[.12,.87],[.16,.83],[.19,.99]]]},
 second:{areas:[[[.24,.99],[.27,.93],[.29,.93],[.28,.99]]]},
 kitchen:{areas:[[[.27,.99],[.36,.84],[.54,.83],[.66,.99]]]},
 bath:{areas:[[[.37,.91],[.4,.87],[.45,.87],[.49,.91]]]},
 balcony:{areas:[[[.26,.82],[.30,.76],[.59,.75],[.64,.79],[.61,.82],[.34,.84]]]},
 utility:{areas:[[[.43,.99],[.49,.84],[.62,.84],[.72,.99]]]}
};
export const ATELIER_FLOORS={'flora-original':COUTURE_FLOORS['silver-retreat'],'verde-atelier':structuredClone(shared),'azure-silence':structuredClone(shared)};
