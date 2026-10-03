// Caching Daynamic
const cacheItems = document.querySelectorAll('.cacheItem')
cacheItems.forEach(item => {
    if (item.src !== undefined) {
        item.src = item.src + cacheVersion
    } else if (item.href !== undefined) {
        item.href = item.href + cacheVersion
    } else if (item.content !== undefined) {
        item.content = item.content + cacheVersion
    } else {
        console.log(item)
    }
})