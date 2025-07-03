/**
 * 时间格式化工具函数，支持中英文切换
 * Time formatting utility with i18n support
 */

export const formatTimeAgo = (timestamp, locale = 'en', t) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return t('time.justNow')
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return locale === 'zh' 
      ? `${diffInMinutes} ${t('time.minutesAgo')}`
      : `${diffInMinutes} ${t('time.minutesAgo')}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return locale === 'zh' 
      ? `${diffInHours} ${t('time.hoursAgo')}`
      : `${diffInHours} ${t('time.hoursAgo')}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return locale === 'zh' 
      ? `${diffInDays} ${t('time.daysAgo')}`
      : `${diffInDays} ${t('time.daysAgo')}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return locale === 'zh' 
      ? `${diffInWeeks} ${t('time.weeksAgo')}`
      : `${diffInWeeks} ${t('time.weeksAgo')}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return locale === 'zh' 
      ? `${diffInMonths} ${t('time.monthsAgo')}`
      : `${diffInMonths} ${t('time.monthsAgo')}`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return locale === 'zh' 
    ? `${diffInYears} ${t('time.yearsAgo')}`
    : `${diffInYears} ${t('time.yearsAgo')}`
}

/**
 * 获取最新帖子的时间戳，用于显示 subreddit 的最后更新时间
 * Get the latest post timestamp to show subreddit last update time
 */
export const getLatestPostTime = (posts) => {
  if (!posts || posts.length === 0) return null
  
  // 找到最新的帖子时间戳
  const latestTimestamp = Math.max(...posts.map(post => post.created || 0))
  return latestTimestamp > 0 ? latestTimestamp : null
}

/**
 * 计算所有帖子的总评论数
 * Calculate total comments count for all posts
 */
export const getTotalComments = (posts) => {
  if (!posts || posts.length === 0) return 0
  
  return posts.reduce((total, post) => {
    return total + (post.comment_count || 0)
  }, 0)
} 