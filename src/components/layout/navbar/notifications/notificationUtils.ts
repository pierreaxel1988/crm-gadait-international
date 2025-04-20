
export const formatNotificationTime = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)} h`;
  } else {
    return `${Math.floor(diffInMinutes / (60 * 24))} jours`;
  }
};
