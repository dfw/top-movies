'use strict';

$(function() {
  var user_action = ('ontouchend' in document.documentElement) ? 'touchend' : 'click';

  var movie_search = {
    url: 'https://api.themoviedb.org/3/discover/movie',
    data: {
      api_key: 'a28d62f038d4e725553b9a8320ee18cd',
      primary_release_year: '',
      sort_by: 'popularity.desc',
      page: 1
    },
    layout: 'grid',
    init: function() {
      movie_search.animate_type();
    },
    fetch: function(yr, pg) {
      if (yr &&
          yr !== movie_search.data.primary_release_year) {
        movie_search.update_year(yr);
      }

      if (pg &&
          pg !== movie_search.data.page) {
        movie_search.update_page(pg);
      }

      var jqxhr = $.getJSON(movie_search.url, movie_search.data, function(data) {
        if (data.total_results > 0) {
          // Header
          var header_tmpl = movie_search.get_template('tmpl-header');
          var pag_obj = movie_search.build_pagination(data);
          movie_search.render_content('header', header_tmpl, pag_obj);
          // Movies
          var movies_tmpl = movie_search.get_template('tmpl-movies');
          var movies_obj = data;
          movie_search.render_content('movies', movies_tmpl, movies_obj);
          // Pagination
          var pag_tmpl = movie_search.get_template('tmpl-pagination');
          movie_search.render_content('pagination', pag_tmpl, pag_obj);
        } else {
          // No movies
          var no_movies_tmpl = movie_search.get_template('tmpl-no-movies');
          movie_search.render_content('movies', no_movies_tmpl);
          movie_search.remove_header();
          movie_search.remove_pagination();
        }
      })
        .done(function() {
          movie_search.change_layout(movie_search.layout);
          movie_search.fade_in();
        })
        .fail(function() {
          var no_movies_tmpl = movie_search.get_template('tmpl-no-movies');
          movie_search.render_content('movies', no_movies_tmpl);
          movie_search.remove_header();
          movie_search.remove_pagination();
        });
    },
    update_year: function(yr) {
      movie_search.data.primary_release_year = yr;
    },
    update_page: function(pg) {
      movie_search.data.page = pg;
    },
    get_template: function(id) {
      var tmpl = $('#' + id).html();
      return tmpl;
    },
    build_pagination: function(da) {
      var pag = {
        prev: false,
        pages: [],
        next: false,
        current_page: da.page,
        last_page: da.total_pages
      };

      if (da.page > 1) {
        pag.prev = true;
      }

      for (var i = 1; i <= da.total_pages; i++) {
        var obj = {
          number: i
        };

        if (da.page === i) {
          obj.selected = true;
        }

        pag.pages.push(obj);
      }

      if (da.page < da.total_pages) {
        pag.next = true;
      }

      return pag;
    },
    render_content: function(id, template, data) {
      var rendered = template;

      if (data) {
        rendered = Mustache.render(template, data);
      }

      $('#' + id).html(rendered);
    },
    remove_header: function() {
      $('#header').html('');
    },
    remove_pagination: function() {
      $('#pagination').html('');
    },
    change_layout: function(style) {
      $('#layout li').removeClass('active');

      $('#' + style).addClass('active');

      if (style === 'list') {
        $('#movies ul').addClass('list');
      } else {
        $('#movies ul').removeClass('list');
      }

      movie_search.layout = style;
    },
    fade_in: function() {
      $('#movies li').each(function(index) {
        $(this).delay(150 * index).fadeTo(500, 1);
      });
    },
    animate_type: function() {
      $('#year').focus();

      setTimeout(function() {
        $('#year').val('2');
      }, 1000);

      setTimeout(function() {
        $('#year').val('20');
      }, 1250);

      setTimeout(function() {
        $('#year').val('201');
      }, 1600);

      setTimeout(function() {
        $('#year').val('2015');

        movie_search.fetch('2015', 1);

        $('#movies').removeClass('loading');
      }, 1800);
    }
  };

  movie_search.init();

  get_year();

  document.addEventListener('touchstart', function(){}, true);

  $('#year').on('keypress', is_integer);

  $('#year').on('keyup', function() {
    var year = $(this).val();
    if (is_valid_year(year)) {
      movie_search.fetch(year, 1);
    }
  });

  $('body').on('change', '#pagination select', function() {
    var page = parseInt($(this).val());

    movie_search.fetch(movie_search.data.primary_release_year, page);

    movie_search.change_layout(movie_search.layout);

    $('html, body').scrollTop(0);
  });

  $('body').on(user_action, '#pagination .prev, #pagination .next', function() {
    var page = movie_search.data.page;

    if ($(this).hasClass('prev')) {
      page -= 1;
    } else if ($(this).hasClass('next')) {
      page += 1;
    }

    movie_search.fetch(movie_search.data.primary_release_year, page);

    $('html, body').scrollTop(0);
  });

  $('body').on(user_action, '#layout li', function() {
    movie_search.change_layout(this.id);
  });

  function is_integer(evt) {
    evt = (evt) ? evt : window.event;

    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode > 31 &&
        (charCode < 48 || charCode > 57)) {
      return false;
    }

    return true;
  }

  function is_valid_year(yr) {
    if (yr.length === 4 &&
        yr !== movie_search.data.primary_release_year) {
      return true;
    }

    return false;
  }

  function get_year() {
    var d = new Date();
    var yr = d.getFullYear();
    $('.year').html(yr);
  }
});