// Conservative visible-floor boundaries reviewed against the new v36 photos.
// Keep rugs, furniture and glass outside the material preview.
const shared={
 living:{areas:[[[0,1],[0,.92],[.18,.73],[.20,.65],[.30,.65],[.22,.94],[1,.97],[1,1]]]},
 dining:{areas:[[[.07,.94],[.08,.79],[.24,.78],[.24,.88],[.64,.88],[.64,.82],[.85,.81],[.85,.94]]]},
 master:{areas:[[[.125,1],[.135,.81],[.18,.79],[.19,.90],[.21,1]],[[.91,1],[.90,.83],[1,.81],[1,1]]]},
 second:{areas:[[[.20,1],[.235,.82],[.28,.81],[.30,.87],[.27,1]]]},
 kitchen:{areas:[[[.205,1],[.247,.815],[.599,.803],[.725,1]]]},
 bath:{areas:[[[.34,1],[.39,.88],[.44,.84],[.70,.84],[.72,.90],[.67,.95],[.67,1]]]},
 balcony:{areas:[[[.20,.91],[.20,.79],[.44,.76],[.44,.87],[.59,.88],[.86,.89],[.92,.92],[.92,.95]]]},
 utility:{areas:[[[.30,1],[.45,.79],[.735,.795],[.735,.89],[.77,1]]]}
};
export const MINERAL_FLOOR_REGIONS={'plum-gallery':shared,'amber-stone':shared};
