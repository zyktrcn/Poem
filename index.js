const cheerio = require('cheerio')
const https = require('https')
const iconv = require('iconv-lite')
const xlsx = require('node-xlsx')
const fs = require('fs')

// function getUrls(data, n) {
//   console.log('正在获取第' + n + '页数据')
//   const domain = 'https://www.gushiwen.org/'
//   https.get(domain + 'default_' + n + '.aspx', (sres) => {
//     let chunks = []
//     sres.on('data', (chunk) => {
//       chunks.push(chunk)
//     })
//     sres.on('end', () => {
//       let items = data || []
//       const html = iconv.decode(Buffer.concat(chunks), 'UTF-8');
//       const $ = cheerio.load(html, {decodeEntities: false})
//       $('.main3 .left .cont').each((idx, element) => {
//         const $element = $(element).children('p').children('a')
//         items.push([
//           $element.children('b').text(),
//           $element.attr('href')
//         ])
//       })
//       if (n < 100) {
//         getUrls(items, n+1)
//       } else {
//         console.log('获取数据完毕')
//         const buffer = xlsx.build([{name: 'url', data: items}])
//         fs.writeFileSync('./poem.xlsx', buffer)
//       }
//     })
//   })
// }
//
// getUrls([], 1)

const xlsxForm = xlsx.parse(`${__dirname}/poem.xlsx`)[0]
const urls = xlsxForm.data
function getPoemData(data, n) {
  console.log('正在获取第' + (n + 1) + '首古诗数据')
  https.get(urls[n][1], (sres) => {
    let chunks = []
    sres.on('data', (chunk) => {
      chunks.push(chunk)
    })
    sres.on('end', () => {
      let items = data || []
      const html = iconv.decode(Buffer.concat(chunks), 'UTF-8');
      const $ = cheerio.load(html, {decodeEntities: false})
      const target = $('.main3 .left .sons .cont h1').parent()
      const title = target.children('h1').text()
      let dynasty, author
      target.children('.source').children('a').each((index, element) => {
        const $element = $(element)
        if (index === 0) {
          dynasty = $element.text()
        } else {
          author = $element.text()
        }
      })
      const poem = target.children('.contson').text()
      let explain
      $('.main3 .left .sons').each((index, element) => {
        if (index === 1) {
          explain = $(element).children('.contyishang').children('p').text().replace('译文', '')
        }
      })
      console.log(explain)
      // const poemStr = poem.replace(/\n/g, '').replace(/，/g, '|').replace(/。/g, '|')
      // const poemArr = poemStr.split('|')
      items.push([
        title,
        dynasty,
        author,
        poem,
        explain
        // ...poemArr
      ])
      if (n < urls.length - 1) {
        getPoemData(items, n+1)
      } else {
        console.log('获取数据完毕')
        const buffer = xlsx.build([xlsxForm, {name: 'data', data: items}])
        fs.writeFileSync('./poem.xlsx', buffer)
      }
    })
  })
}
getPoemData([], 0)
