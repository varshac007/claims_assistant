// Utility to convert Material Icons ligature names to React elements
// needed because DXC Halstack icon prop does not accept string names
export const iconEl = (name) => <span className="material-icons">{name}</span>;
