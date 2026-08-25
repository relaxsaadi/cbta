// Constante partagée client/serveur — ne doit importer aucune dépendance
// server-only (sinon le bundle client embarquerait mysql2 et échouerait au
// build, comme observé avec question-bank-data.ts).
export const DGR_FUNCTIONS = Array.from({ length: 10 }, (_, i) => `Function 7.${i + 1}`);
