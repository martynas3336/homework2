class ListManager {
  constructor({listBody, pageBody, perPageBody, lastSelectedBody}={}) {
    this.loading = false;
    this.headers = [];
    this.listBody = listBody;
    this.pageBody = pageBody;
    this.perPageBody = perPageBody;
    this.lastSelectedBody = lastSelectedBody;
    this.keyIdentifier = '';
    this.result = [];
    this.orderBy = [];
    this.maxPage = 0;
    this.currentPage = 1;
    this.perPage = 10;
    this.lastSelectedId = 0;
    this.lastSelectedData = {}
  }

  setup() {

    let _this = this;

    this.listBody.on('click', '.theaderCell', function() {
      let identifier = $(this).attr('identifier');
      _this.setOrderBy(identifier)
    })

    this.listBody.on('click', 'tbody tr', function() {
      let id = $(this).find(`[identifier='${_this.keyIdentifier}']`).attr('value');
      _this.setLastSelectedId(id);
    })

    this.pageBody.on('click', '.page', function() {
      let currentPage = $(this).attr('page');
      _this.setCurrentPage(currentPage);
    })

    this.perPageBody.on('change', function() {
      let perPage = this.value;
      _this.setPerPage(perPage);
    })

    this.request();
  }

  setLastSelectedId(id) {
    this.lastSelectedId = id;
    this.lastSelectedData = this.result.filter((obj) => {
      return obj.id == this.lastSelectedId;
    });
    this.markLastSelectedData();
    this.fetchLastSelectedData();
  }

  setHeaders(headers) {
    this.headers = headers;
    this.fetchHeaders();
  }

  setResult(result) {
    this.result = result;
    this.fetchResult();
  }

  setOrderBy(identifier) {

    let match = false;
    let newOrder = '';
    this.orderBy.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        if(key === identifier)
        {
          if(obj[key] == 'ASC')
          {
            newOrder = 'DESC';
          } else {
            newOrder = 'ASC';
          }
          match = true;
        }
      })
    })

    if(match)
    {
      this.orderBy = this.orderBy.filter(obj => !(identifier in obj));
      this.orderBy.push({[identifier]:newOrder});
    } else {
      this.orderBy.push({[identifier]:'ASC'});
    }

    this.request();
  }

  setMaxPage(maxPage) {
    this.maxPage = maxPage;
    this.fetchPages();
  }

  setCurrentPage(page) {
    this.currentPage = parseInt(page);
    this.request();
  }

  setPerPage(perPage) {
    this.perPage = perPage;
    this.request();
  }

  setKeyIdentifier(key) {
    this.keyIdentifier = key;
  }

  fetchHeaders() {
    let theadRow = this.listBody.find('thead tr');
    theadRow.empty();
    this.headers.forEach((header) => {
      theadRow.append($('<th/>', {
        class:'theaderCell',
        html:header,
        identifier:header
      }))
    })
  }

  fetchResult() {
    let tbody = this.listBody.find('tbody');
    tbody.empty();
    this.result.forEach((obj) => {
      tbody.append(
        $('<tr/>').each(function() {
          Object.keys(obj).forEach((key) => {
            $(this).append($('<td/>', {
              identifier:key,
              value:obj[key],
              html:obj[key]
            }))
          })
        })
      )
    })
  }

  fetchPages() {
    let pages = pagination(this.currentPage, this.maxPage);
    this.pageBody.empty();
    pages.forEach((page) => {
      if(page !== '...')
      {
        this.pageBody.append($('<span/>', {
          class:'page',
          page:page,
          html:page
        }))
        this.pageBody.append(' ');
      } else {
        this.pageBody.append('... ');
      }
    })
  }

  fetchLastSelectedData() {
    this.lastSelectedBody.html(JSON.stringify(this.lastSelectedData));
  }

  markLastSelectedData() {
    this.listBody.find('tbody tr.selected').removeClass('selected');
    this.listBody.find(`[value='${this.lastSelectedId}'][identifier='${this.keyIdentifier}']`).closest('tr').addClass('selected');
  }

  request() {
    let loadingObject = this.headers.reduce((o, item) => {
      o[`_${item}`] = 'loading';
      return o;
    }, {});

    this.setResult([loadingObject]);

    if(!this.loading)
    {
      this.loading = true;
      $.ajax({
        url: "https://test2.dealerproductions.com/api/list",
        method:'GET',
        data: {
          "perPage":this.perPage,
          "page":this.currentPage,
          "orderBy":this.orderBy
        },
        cache: false,
        success: (data) => {
          this.setMaxPage(data.maxPage);
          this.setHeaders(data.headers);
          this.setKeyIdentifier(data.keyIdentifier);
          this.setResult(data.result);
          this.markLastSelectedData();
          this.loading = false;
        }
      });
    }
  }
}

function pagination(c, m) {
  let current = c;
  let last = m;
  let delta = 2;
  let left = current - delta;
  let right = current + delta + 1;
  let range = [];
  let rangeWithDots = [];
  let l;

  for (let i = 1; i <= last; i++) {
    if (i == 1 || i == last || i >= left && i < right) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
}
