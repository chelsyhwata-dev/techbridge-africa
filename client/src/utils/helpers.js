export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function getStatusColor(status) {
  const colors = {
    pending: 'badge-gold',
    reviewed: 'badge-blue',
    shortlisted: 'badge-blue',
    accepted: 'badge-green',
    rejected: 'badge-red',
    open: 'badge-green',
    closed: 'badge-red',
    draft: 'badge-gray',
    completed: 'badge-green',
    failed: 'badge-red',
  };
  return colors[status] || 'badge-gray';
}

export function getMatchColor(score) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-orange-100 text-orange-700 border-orange-300';
}

export function getJobTypeBadge(type) {
  const badges = {
    internship: 'badge-blue',
    graduate: 'badge-green',
    graduate_programme: 'badge-green',
    entry_level: 'badge-sunset',
    learnership: 'badge-pink',
    'part-time': 'badge-gold',
    'full-time': 'badge-blue',
    contract: 'badge-gray',
  };
  return badges[type] || 'badge-gray';
}

export function formatJobType(type) {
  const labels = {
    internship: 'Internship',
    graduate: 'Graduate',
    graduate_programme: 'Graduate Programme',
    entry_level: 'Entry-Level',
    learnership: 'Learnership',
    'part-time': 'Part-time',
    'full-time': 'Full-time',
    contract: 'Contract',
  };
  return labels[type] || type;
}

export function parseSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    try { return JSON.parse(skills); } catch { return []; }
  }
  return [];
}
