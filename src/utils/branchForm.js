// Editable venue fields (Admin → Branches and Admin → Bar-X)
export function blankBranch() {
  return {
    name: '', address: '', phone_primary: '', phone_secondary: '', established_year: '', description: '', active: true,
    image_url: '', tagline: '', opening_hours: '', map_url: '', venue_type: 'pub', position: 0,
    eyebrow: '', story_title: '', story: '', signatures_title: '', stats: [], features: [], signatures: [],
  }
}

/** Copy of a venue from the API holding only the editable fields */
export function branchToForm(branch) {
  const blank = blankBranch()
  return Object.fromEntries(Object.keys(blank).map(k => {
    const v = branch?.[k] ?? blank[k]
    return [k, Array.isArray(v) ? v.map(r => ({ ...r })) : v]
  }))
}
