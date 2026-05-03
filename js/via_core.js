var attributes_panel      = document.getElementById('attributes_panel');
var leftsidebar           = document.getElementById('leftsidebar');

var BBOX_LINE_WIDTH       = 4;
var BBOX_SELECTED_OPACITY = 0.3;
var BBOX_BOUNDARY_FILL_COLOR_ANNOTATED = "#f2f2f2";
var BBOX_BOUNDARY_FILL_COLOR_NEW       = "#aaeeff";
var BBOX_BOUNDARY_LINE_COLOR           = "#1a1a1a";
var BBOX_SELECTED_FILL_COLOR           = "#ffffff";

var VIA_ANNOTATION_EDITOR_HEIGHT_CHANGE   = 5;   // in percent
var VIA_ANNOTATION_EDITOR_FONTSIZE_CHANGE = 0.1; // in rem
var VIA_IMAGE_GRID_IMG_HEIGHT_CHANGE      = 20;  // in percent
var VIA_LEFTSIDEBAR_WIDTH_CHANGE          = 1;   // in rem
var VIA_POLYGON_SEGMENT_SUBTENDED_ANGLE   = 5;   // in degree (used to approximate shapes using polygon)
var VIA_FLOAT_PRECISION = 3; // number of decimal places to include in float values

// COCO Export
var VIA_COCO_EXPORT_RSHAPE = ['rect', 'circle', 'ellipse', 'polygon', 'point'];
//
//
// Data structure to store metadata about file and regions
//
var VIA_COCO_EXPORT_ATTRIBUTE_TYPE;

function file_metadata(filename, size) {
  this.filename = filename;
  this.size     = size;         // file size in bytes
  this.regions  = [];           // array of file_region()
  this.file_attributes = {};    // image attributes
}

function file_region() {
  this.shape_attributes  = {}; // region shape attributes
  this.region_attributes = {}; // region attributes
}

//
// Initialization routine
//
function _via_init() {
  VIA_COCO_EXPORT_ATTRIBUTE_TYPE = [VIA_ATTRIBUTE_TYPE.DROPDOWN,
                                    VIA_ATTRIBUTE_TYPE.RADIO];

  console.log(VIA_NAME);
  show_message(VIA_NAME + ' (' + VIA_SHORT_NAME + ') version ' + VIA_VERSION +
               '. Ready !', 2*VIA_THEME_MESSAGE_TIMEOUT_MS);

  if ( _via_is_debug_mode ) {
    document.getElementById('ui_top_panel').innerHTML += '<span>DEBUG MODE</span>';
  }

  document.getElementById('img_fn_list').style.display = 'block';
  document.getElementById('leftsidebar').style.display = 'table-cell';

  // initialize default project
  project_init_default_project();

  // initialize region canvas 2D context
  _via_init_reg_canvas_context();

  // initialize mask annotation module
  if (typeof mask_init === 'function') {
    mask_init();
  }

  // initialize user input handlers (for both window and via_reg_canvas)
  // handles drawing of regions by user over the image
  _via_init_keyboard_handlers();
  _via_init_mouse_handlers();

  // initialize image grid
  image_grid_init();

  show_single_image_view();
  init_leftsidebar_accordion();
  attribute_update_panel_set_active_button();
  annotation_editor_set_active_button();
  init_message_panel();
  annotation_editor_toggle_all_regions_editor();

  // run attached sub-modules (if any)
  // e.g. demo modules
  if (typeof _via_load_submodules === 'function') {
    console.log('Loading VIA submodule');
    setTimeout( async function() {
      await _via_load_submodules();
    }, 100);
  }

}

function _via_init_reg_canvas_context() {
  _via_reg_ctx  = _via_reg_canvas.getContext('2d');
}

function _via_init_keyboard_handlers() {
  window.addEventListener('keydown', _via_window_keydown_handler, false);
  _via_reg_canvas.addEventListener('keydown', _via_reg_canvas_keydown_handler, false);
  _via_reg_canvas.addEventListener('keyup', _via_reg_canvas_keyup_handler, false);
}

// handles drawing of regions over image by the user
function _via_init_mouse_handlers() {
  _via_reg_canvas.addEventListener('dblclick', _via_reg_canvas_dblclick_handler, false);
  _via_reg_canvas.addEventListener('mousedown', _via_reg_canvas_mousedown_handler, false);
  _via_reg_canvas.addEventListener('mouseup', _via_reg_canvas_mouseup_handler, false);
  _via_reg_canvas.addEventListener('mouseover', _via_reg_canvas_mouseover_handler, false);
  _via_reg_canvas.addEventListener('mousemove', _via_reg_canvas_mousemove_handler, false);
  _via_reg_canvas.addEventListener('mouseleave', function(e) { if (_via_mask_mode) mask_canvas_mouseleave(e); }, false);
  _via_reg_canvas.addEventListener('wheel', _via_reg_canvas_mouse_wheel_listener, false);
  // touch screen event handlers
  // @todo: adapt for mobile users
  _via_reg_canvas.addEventListener('touchstart', _via_reg_canvas_mousedown_handler, false);
  _via_reg_canvas.addEventListener('touchend', _via_reg_canvas_mouseup_handler, false);
  _via_reg_canvas.addEventListener('touchmove', _via_reg_canvas_mousemove_handler, false);
}

//
// Download image with annotations
//

function download_as_image() {
  if ( _via_display_area_content_name !== VIA_DISPLAY_AREA_CONTENT_NAME['IMAGE'] ) {
    show_message('This functionality is only available in single image view mode');
    return;
  } else {
    var c = document.createElement('canvas');

    // ensures that downloaded image is scaled at current zoom level
    c.width  = _via_reg_canvas.width;
    c.height = _via_reg_canvas.height;

    var ct = c.getContext('2d');
    // draw current image
    ct.drawImage(_via_current_image,
           _via_reg_canvas_margin,
           _via_reg_canvas_margin,
           _via_canvas_width,
           _via_canvas_height);
    // draw current regions
    ct.drawImage(_via_reg_canvas, 0, 0);

    var cur_img_mime = 'image/jpeg';
    if ( _via_current_image.src.startsWith('data:') )  {
      var c1 = _via_current_image.src.indexOf(':', 0);
      var c2 = _via_current_image.src.indexOf(';', c1);
      cur_img_mime = _via_current_image.src.substring(c1 + 1, c2);
    }

    // extract image data from canvas
    var saved_img = c.toDataURL(cur_img_mime);
    saved_img.replace(cur_img_mime, "image/octet-stream");

    // simulate user click to trigger download of image
    var a      = document.createElement('a');
    a.href     = saved_img;
    a.target   = '_blank';
    a.download = _via_current_image_filename;

    // simulate a mouse click event
    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    a.dispatchEvent(event);
  }
}

//
// Display area content
//
function clear_display_area() {
  var panels = document.getElementsByClassName('display_area_content');
  var i;
  for ( i = 0; i < panels.length; ++i ) {
    panels[i].classList.add('display_none');
  }
}

function is_content_name_valid(content_name) {
  var e;
  for ( e in VIA_DISPLAY_AREA_CONTENT_NAME ) {
    if ( VIA_DISPLAY_AREA_CONTENT_NAME[e] === content_name ) {
      return true;
    }
  }
  return false;
}

function show_home_panel() {
  show_single_image_view();
}

function set_display_area_content(content_name) {
  if ( is_content_name_valid(content_name) ) {
    _via_display_area_content_name_prev = _via_display_area_content_name;
    clear_display_area();
    var p = document.getElementById(content_name);
    p.classList.remove('display_none');
    _via_display_area_content_name = content_name;
  }
}

function show_single_image_view() {
  if (_via_current_image_loaded) {
    img_fn_list_clear_all_style();
    _via_show_img(_via_image_index);
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE);
    annotation_editor_update_content();

    var p = document.getElementById('toolbar_image_grid_toggle');
    p.firstChild.setAttribute('xlink:href', '#icon_gridon');
    p.childNodes[1].innerHTML = 'Switch to Image Grid View';
  } else {
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.PAGE_START_INFO);
  }
}

function show_image_grid_view() {
  if (_via_current_image_loaded) {
    img_fn_list_clear_all_style();
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID);
    image_grid_toolbar_update_group_by_select();

    if ( _via_image_grid_group_var.length === 0 ) {
      image_grid_show_all_project_images();
    }
    annotation_editor_update_content();

    var p = document.getElementById('toolbar_image_grid_toggle');
    p.firstChild.setAttribute('xlink:href', '#icon_gridoff');
    p.childNodes[1].innerHTML = 'Switch to Single Image View';

    //edit_file_metadata_in_annotation_editor();
  } else {
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.PAGE_START_INFO);
  }
}

//
// Handlers for top navigation bar
//
function sel_local_images() {
  // source: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
  if (invisible_file_input) {
    invisible_file_input.setAttribute('multiple', 'multiple');
    invisible_file_input.accept   = '.jpg,.jpeg,.png,.bmp';
    invisible_file_input.onchange = project_file_add_local;
    invisible_file_input.click();
  }
}

// invoked by menu-item buttons in HTML UI
function download_all_region_data(type, file_extension) {
  if ( typeof(file_extension) === 'undefined' ) {
    file_extension = type;
  }
  // Javascript strings (DOMString) is automatically converted to utf-8
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob
  pack_via_metadata(type).then( function(data) {
    var blob_attr = {type: 'text/'+file_extension+';charset=utf-8'};
    var all_region_data_blob = new Blob(data, blob_attr);

    var filename = 'via_export';
    if(typeof(_via_settings) !== 'undefined' &&
       _via_settings.hasOwnProperty('project') &&
       _via_settings['project']['name'] !== '') {
      filename = _via_settings['project']['name'];
    }
    if ( file_extension !== 'csv' || file_extension !== 'json' ) {
      filename += '_' + type + '.' + file_extension;
    }
    save_data_to_local_file(all_region_data_blob, filename);
  }.bind(this), function(err) {
    show_message('Failed to download data: [' + err + ']');
  }.bind(this));
}

function sel_local_data_file(type) {
  if (invisible_file_input) {
    switch(type) {
    case 'annotations':
      invisible_file_input.accept='.csv,.json';
      invisible_file_input.onchange = import_annotations_from_file;
      break;

    case 'annotations_coco':
      invisible_file_input.accept='.json';
      invisible_file_input.onchange = load_coco_annotations_json_file;
      break;

    case 'files_url':
      invisible_file_input.accept='';
      invisible_file_input.onchange = import_files_url_from_file;
      break;

    case 'attributes':
      invisible_file_input.accept='json';
      invisible_file_input.onchange = project_import_attributes_from_file;
      break;

    default:
      console.log('sel_local_data_file() : unknown type ' + type);
      return;
    }
    invisible_file_input.removeAttribute('multiple');
    invisible_file_input.click();
  }
}

//
// Data Importer
//
function import_files_url_from_file(event) {
  var selected_files = event.target.files;
  var i, file;
  for ( i = 0; i < selected_files.length; ++i ) {
    file = selected_files[i];
    load_text_file(file, import_files_url_from_csv);
  }
}

function import_annotations_from_file(event) {
  var selected_files = event.target.files;
  var i, file;
  for ( i = 0; i < selected_files.length; ++i ) {
    file = selected_files[i];
    switch ( file.type ) {
    case '': // Fall-through // Windows 10: Firefox and Chrome do not report filetype
      show_message('File type for ' + file.name + ' cannot be determined! Assuming text/plain.');
    case 'text/plain': // Fall-through
    case 'application/vnd.ms-excel': // Fall-through // @todo: filetype of VIA csv annotations in Windows 10 , fix this (reported by @Eli Walker)
    case 'text/csv':
      load_text_file(file, import_annotations_from_csv);
      break;

    case 'text/json': // Fall-through
    case 'application/json':
      load_text_file(file, import_annotations_from_json);
      break;

    default:
      show_message('Annotations cannot be imported from file of type ' + file.type);
      break;
    }
  }
}

function load_coco_annotations_json_file(event) {
  load_text_file(event.target.files[0], import_coco_annotations_from_json);
}

function import_annotations_from_csv(data) {
  return new Promise( function(ok_callback, err_callback) {
    if ( data === '' || typeof(data) === 'undefined') {
      err_callback();
    }

    var region_import_count = 0;
    var malformed_csv_lines_count = 0;
    var file_added_count = 0;

    var line_split_regex = new RegExp('\n|\r|\r\n', 'g');
    var csvdata = data.split(line_split_regex);

    var parsed_header = parse_csv_header_line(csvdata[0]);
    if ( ! parsed_header.is_header ) {
      show_message('Header line missing in the CSV file');
      err_callback();
      return;
    }

    var n = csvdata.length;
    var i;
    var first_img_id = '';
    for ( i = 1; i < n; ++i ) {
      // ignore blank lines
      if (csvdata[i].charAt(0) === '\n' || csvdata[i].charAt(0) === '') {
        continue;
      }

      var d = parse_csv_line(csvdata[i]);

      // check if csv line was malformed
      if ( d.length !== parsed_header.csv_column_count ) {
        malformed_csv_lines_count += 1;
        continue;
      }

      var filename = d[parsed_header.filename_index];
      var size     = d[parsed_header.size_index];
      var img_id   = _via_get_image_id(filename, size);

      // check if file is already present in this project
      if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
        img_id = project_add_new_file(filename, size);
        if ( _via_settings.core.default_filepath === '' ) {
          _via_img_src[img_id] = filename;
        } else {
          _via_file_resolve_file_to_default_filepath(img_id);
        }
        file_added_count += 1;

        if ( first_img_id === '' ) {
          first_img_id = img_id;
        }
      }

      // copy file attributes
      if ( d[parsed_header.file_attr_index] !== '"{}"') {
        var fattr = d[parsed_header.file_attr_index];
        fattr     = remove_prefix_suffix_quotes( fattr );
        fattr     = unescape_from_csv( fattr );

        var m = json_str_to_map( fattr );
        for( var key in m ) {
          _via_img_metadata[img_id].file_attributes[key] = m[key];

          // add this file attribute to _via_attributes
          if ( ! _via_attributes['file'].hasOwnProperty(key) ) {
            _via_attributes['file'][key] = { 'type':'text' };
          }
        }
      }

      var region_i = new file_region();
      // copy regions shape attributes
      if ( d[parsed_header.region_shape_attr_index] !== '"{}"' ) {
        var sattr = d[parsed_header.region_shape_attr_index];
        sattr     = remove_prefix_suffix_quotes( sattr );
        sattr     = unescape_from_csv( sattr );

        var m = json_str_to_map( sattr );
        for ( var key in m ) {
          region_i.shape_attributes[key] = m[key];
        }
      }

      // copy region attributes
      if ( d[parsed_header.region_attr_index] !== '"{}"' ) {
        var rattr = d[parsed_header.region_attr_index];
        rattr     = remove_prefix_suffix_quotes( rattr );
        rattr     = unescape_from_csv( rattr );

        var m = json_str_to_map( rattr );
        for ( var key in m ) {
          region_i.region_attributes[key] = m[key];

          // add this region attribute to _via_attributes
          if ( ! _via_attributes['region'].hasOwnProperty(key) ) {
            _via_attributes['region'][key] = { 'type':'text' };
          }
        }
      }

      // add regions only if they are present
      if (Object.keys(region_i.shape_attributes).length > 0 ||
          Object.keys(region_i.region_attributes).length > 0 ) {
        _via_img_metadata[img_id].regions.push(region_i);
        region_import_count += 1;
      }
    }
    show_message('Import Summary : [' + file_added_count + '] new files, ' +
                 '[' + region_import_count + '] regions, ' +
                 '[' + malformed_csv_lines_count  + '] malformed csv lines.');

    if ( file_added_count ) {
      update_img_fn_list();
    }

    if ( _via_current_image_loaded ) {
      if ( region_import_count ) {
        update_attributes_update_panel();
        annotation_editor_update_content();
        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
      }
    } else {
      if ( file_added_count ) {
        var first_img_index = _via_image_id_list.indexOf(first_img_id);
        _via_show_img( first_img_index );
      }
    }
    ok_callback([file_added_count, region_import_count, malformed_csv_lines_count]);
  });
}

function parse_csv_header_line(line) {
  var header_via_10x = '#filename,file_size,file_attributes,region_count,region_id,region_shape_attributes,region_attributes'; // VIA versions 1.0.x
  var header_via_11x = 'filename,file_size,file_attributes,region_count,region_id,region_shape_attributes,region_attributes'; // VIA version 1.1.x

  if ( line === header_via_10x || line === header_via_11x ) {
    return { 'is_header':true,
             'filename_index': 0,
             'size_index': 1,
             'file_attr_index': 2,
             'region_shape_attr_index': 5,
             'region_attr_index': 6,
             'csv_column_count': 7
           }
  } else {
    return { 'is_header':false };
  }
}

// see http://cocodataset.org/#format-data
function import_coco_annotations_from_json(data_str) {
  return new Promise( function(ok_callback, err_callback) {
    if (data_str === '' || typeof(data_str) === 'undefined') {
      show_message('Empty file');
      return;
    }
    var coco = JSON.parse(data_str);
    if( !coco.hasOwnProperty('info') ||
        !coco.hasOwnProperty('categories') ||
        !coco.hasOwnProperty('annotations') ||
        !coco.hasOwnProperty('images') ) {
      show_message('File does not contain valid annotations in COCO format.');
      return;
    }

    // create _via_attributes from coco['categories']
    var category_id_to_attribute_name = {};
    for( var i in coco['categories'] ) {
      var sc    = coco['categories'][i]['supercategory'];
      var cid   = coco['categories'][i]['id'];
      var cname = coco['categories'][i]['name'];
      if( !_via_attributes['region'].hasOwnProperty(sc)) {
        _via_attributes['region'][sc] = {'type':VIA_ATTRIBUTE_TYPE.RADIO,
                                         'description':'coco["categories"][' + i + ']=' + JSON.stringify(coco['categories'][i]),
                                         'options':{},
                                         'default_options':{}
                                        };
      }
      _via_attributes['region'][sc]['options'][cid] = cname;
      category_id_to_attribute_name[cid] = sc;
    }
    // if more than 5 options, convert the attribute type to DROPDOWN
    for( var attr_name in _via_attributes['region'] ) {
      if( Object.keys(_via_attributes['region'][attr_name]['options']).length > 5 ) {
        _via_attributes['region'][attr_name]['type'] = VIA_ATTRIBUTE_TYPE.DROPDOWN;
      }
    }

    // create an map of image_id and their annotations
    var image_id_to_annotation_index = {};
    for ( var annotation_index in coco['annotations'] ) {
      var coco_image_id = coco.annotations[annotation_index]['image_id'];
      if ( !image_id_to_annotation_index.hasOwnProperty(coco_image_id) ) {
        image_id_to_annotation_index[coco_image_id] = [];
      }
      image_id_to_annotation_index[coco_image_id].push( annotation_index );
    }

    // add all files and annotations
    _via_img_metadata = {};
    _via_image_id_list = [];
    _via_image_filename_list = [];
    _via_img_count = 0;
    var imported_file_count = 0;
    var imported_region_count = 0;
    for ( var coco_img_index in coco['images'] ) {
      var coco_img_id = coco['images'][coco_img_index]['id'];
      var filename;
      if ( coco.images[coco_img_index].hasOwnProperty('coco_url') &&
           coco.images[coco_img_index]['coco_url'] !== "") {
        filename = coco.images[coco_img_index]['coco_url'];
      } else {
        filename = coco.images[coco_img_index]['file_name'];
      }
      _via_img_metadata[coco_img_id] = { 'filename':filename,
                                         'size'    :-1,
                                         'regions' :[],
                                         'file_attributes': {
                                           'width' :coco.images[coco_img_index]['width'],
                                           'height':coco.images[coco_img_index]['height']
                                         },
                                       };
      _via_image_id_list.push(coco_img_id);
      _via_image_filename_list.push(filename);
      _via_img_count = _via_img_count + 1;

      // add all annotations associated with this file
      if ( image_id_to_annotation_index.hasOwnProperty(coco_img_id) ) {
        for ( var i in image_id_to_annotation_index[coco_img_id] ) {
          var annotation_i = coco['annotations'][ image_id_to_annotation_index[coco_img_id][i] ];
          var bbox_from_polygon = polygon_to_bbox(annotation_i['segmentation']);

          // ensure rectangles get imported as rectangle (and not as polygon)
          var is_rectangle = true;
          for (var j = 0; i < annotation_i['bbox'].length; ++j) {
            if (annotation_i['bbox'][j] !== bbox_from_polygon[j]) {
              is_rectangle = false;
              break;
            }
          }

          var region_i = { 'shape_attributes': {}, 'region_attributes': {} };
          var attribute_name = category_id_to_attribute_name[ annotation_i['category_id'] ];
          var attribute_value = annotation_i['category_id'].toString();
          region_i['region_attributes'][attribute_name] = attribute_value;

          if ( annotation_i['segmentation'][0].length === 8 && is_rectangle ) {
            region_i['shape_attributes'] = { 'name':'rect',
                                             'x': annotation_i['bbox'][0],
                                             'y': annotation_i['bbox'][1],
                                             'width': annotation_i['bbox'][2],
                                             'height': annotation_i['bbox'][3]};
          } else {
            region_i['shape_attributes'] = { 'name':'polygon',
                                             'all_points_x':[],
                                             'all_points_y':[]};
            for ( var j = 0; j < annotation_i['segmentation'][0].length; j = j + 2 ) {
              region_i['shape_attributes']['all_points_x'].push( annotation_i['segmentation'][0][j] );
              region_i['shape_attributes']['all_points_y'].push( annotation_i['segmentation'][0][j+1] );
            }
          }
          _via_img_metadata[coco_img_id]['regions'].push(region_i);
          imported_region_count = imported_region_count + 1;
        }
      }
    }
    show_message('Import Summary : [' + _via_img_count + '] new files, ' +
                 '[' + imported_region_count + '] regions.');

    if(_via_img_count) {
      update_img_fn_list();
    }

    if(_via_current_image_loaded) {
      if(imported_region_count) {
        update_attributes_update_panel();
        annotation_editor_update_content();
        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
      }
    } else {
      if(_via_img_count) {
        _via_show_img(0);
      }
    }
    ok_callback([_via_img_count, imported_region_count, 0]);
  });
}

function import_annotations_from_json(data_str) {
  return new Promise( function(ok_callback, err_callback) {
    if (data_str === '' || typeof(data_str) === 'undefined') {
      return;
    }

    var d = JSON.parse(data_str);
    var region_import_count = 0;
    var file_added_count    = 0;
    var malformed_entries_count    = 0;
    for (var img_id in d) {
      if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
        project_add_new_file(d[img_id].filename, d[img_id].size, img_id);
        if ( _via_settings.core.default_filepath === '' ) {
          _via_img_src[img_id] = d[img_id].filename;
        } else {
          _via_file_resolve_file_to_default_filepath(img_id);
        }
        file_added_count += 1;
      }

      // copy file attributes
      for ( var key in d[img_id].file_attributes ) {
        if ( key === '' ) {
          continue;
        }

        _via_img_metadata[img_id].file_attributes[key] = d[img_id].file_attributes[key];

        // add this file attribute to _via_attributes
        if ( ! _via_attributes['file'].hasOwnProperty(key) ) {
          _via_attributes['file'][key] = { 'type':'text' };
        }
      }

      // copy regions
      var regions = d[img_id].regions;
      for ( var i in regions ) {
        var region_i = new file_region();
        for ( var sid in regions[i].shape_attributes ) {
          region_i.shape_attributes[sid] = regions[i].shape_attributes[sid];
        }
        for ( var rid in regions[i].region_attributes ) {
          if ( rid === '' ) {
            continue;
          }

          region_i.region_attributes[rid] = regions[i].region_attributes[rid];

          // add this region attribute to _via_attributes
          if ( ! _via_attributes['region'].hasOwnProperty(rid) ) {
            _via_attributes['region'][rid] = { 'type':'text' };
          }
        }

        // add regions only if they are present
        if ( Object.keys(region_i.shape_attributes).length > 0 ||
             Object.keys(region_i.region_attributes).length > 0 ) {
          _via_img_metadata[img_id].regions.push(region_i);
          region_import_count += 1;
        }
      }
    }
    show_message('Import Summary : [' + file_added_count + '] new files, ' +
                 '[' + region_import_count + '] regions, ' +
                 '[' + malformed_entries_count + '] malformed entries.');

    if ( file_added_count ) {
      update_img_fn_list();
    }

    if ( _via_current_image_loaded ) {
      if ( region_import_count ) {
        update_attributes_update_panel();
        annotation_editor_update_content();
        _via_load_canvas_regions(); // image to canvas space transform
        _via_redraw_reg_canvas();
        _via_reg_canvas.focus();
      }
    } else {
      if ( file_added_count ) {
        _via_show_img(0);
      }
    }

    ok_callback([file_added_count, region_import_count, malformed_entries_count]);
  });
}

// assumes that csv line follows the RFC 4180 standard
// see: https://en.wikipedia.org/wiki/Comma-separated_values
function parse_csv_line(s, field_separator) {
  if (typeof(s) === 'undefined' || s.length === 0 ) {
    return [];
  }

  if (typeof(field_separator) === 'undefined') {
    field_separator = ',';
  }
  var double_quote_seen = false;
  var start = 0;
  var d = [];

  var i = 0;
  while ( i < s.length) {
    if (s.charAt(i) === field_separator) {
      if (double_quote_seen) {
        // field separator inside double quote is ignored
        i = i + 1;
      } else {
        //var part = s.substr(start, i - start);
        d.push( s.substr(start, i - start) );
        start = i + 1;
        i = i + 1;
      }
    } else {
      if (s.charAt(i) === '"') {
        if (double_quote_seen) {
          if (s.charAt(i+1) === '"') {
            // ignore escaped double quotes
            i = i + 2;
          } else {
            // closing of double quote
            double_quote_seen = false;
            i = i + 1;
          }
        } else {
          double_quote_seen = true;
          start = i;
          i = i + 1;
        }
      } else {
        i = i + 1;
      }
    }

  }
  // extract the last field (csv rows have no trailing comma)
  d.push( s.substr(start) );
  return d;
}

// s = '{"name":"rect","x":188,"y":90,"width":243,"height":233}'
function json_str_to_map(s) {
  if (typeof(s) === 'undefined' || s.length === 0 ) {
    return {};
  }

  return JSON.parse(s);
}

// ensure the exported json string conforms to RFC 4180
// see: https://en.wikipedia.org/wiki/Comma-separated_values
function map_to_json(m) {
  var s = [];
  for ( var key in m ) {
    var v   = m[key];
    var si  = JSON.stringify(key);
    si += VIA_CSV_KEYVAL_SEP;
    si += JSON.stringify(v);
    s.push( si );
  }
  return '{' + s.join(VIA_CSV_SEP) + '}';
}

function escape_for_csv(s) {
  return s.replace(/["]/g, '""');
}

function unescape_from_csv(s) {
  return s.replace(/""/g, '"');
}

function remove_prefix_suffix_quotes(s) {
  if ( s.charAt(0) === '"' && s.charAt(s.length-1) === '"' ) {
    return s.substr(1, s.length-2);
  } else {
    return s;
  }
}

function clone_image_region(r0) {
  var r1 = new file_region();

  // copy shape attributes
  for ( var key in r0.shape_attributes ) {
    r1.shape_attributes[key] = clone_value(r0.shape_attributes[key]);
  }

  // copy region attributes
  for ( var key in r0.region_attributes ) {
    r1.region_attributes[key] = clone_value(r0.region_attributes[key]);
  }
  return r1;
}

function clone_value(value) {
  if ( typeof(value) === 'object' ) {
    if ( Array.isArray(value) ) {
      return value.slice(0);
    } else {
      var copy = {};
      for ( var p in value ) {
        if ( value.hasOwnProperty(p) ) {
          copy[p] = clone_value(value[p]);
        }
      }
      return copy;
    }
  }
  return value;
}

function _via_get_image_id(filename, size) {
  if ( typeof(size) === 'undefined' ) {
    return filename;
  } else {
    return filename + size;
  }
}

function load_text_file(text_file, callback_function) {
  if (text_file) {
    var text_reader = new FileReader();
    text_reader.addEventListener( 'progress', function(e) {
      show_message('Loading data from file : ' + text_file.name + ' ... ');
    }, false);

    text_reader.addEventListener( 'error', function() {
      show_message('Error loading data text file :  ' + text_file.name + ' !');
      callback_function('');
    }, false);

    text_reader.addEventListener( 'load', function() {
      callback_function(text_reader.result);
    }, false);
    text_reader.readAsText(text_file, 'utf-8');
  }
}

function import_files_url_from_csv(data) {
  return new Promise( function(ok_callback, err_callback) {
    if ( data === '' || typeof(data) === 'undefined') {
      err_callback();
    }

    var malformed_url_count = 0;
    var url_added_count = 0;

    var line_split_regex = new RegExp('\n|\r|\r\n', 'g');
    var csvdata = data.split(line_split_regex);

    var percent_completed = 0;
    var n = csvdata.length;
    var i;
    var img_id;
    var first_img_id = '';
    for ( i=0; i < n; ++i ) {
      // ignore blank lines
      if (csvdata[i].charAt(0) === '\n' || csvdata[i].charAt(0) === '') {
        malformed_url_count += 1;
        continue;
      } else {
        img_id = project_file_add_url(csvdata[i]);
        if ( first_img_id === '' ) {
          first_img_id = img_id;
        }
        url_added_count += 1;
      }
    }
    show_message('Added ' + url_added_count + ' files to project');
    if ( url_added_count ) {
      var first_img_index = _via_image_id_list.indexOf(first_img_id);
      _via_show_img(first_img_index);
      update_img_fn_list();
    }
  });
}

//
// Data Exporter
//
function pack_via_metadata(return_type) {
  return new Promise( function(ok_callback, err_callback) {
    if( return_type === 'csv' ) {
      var csvdata = [];
      var csvheader = 'filename,file_size,file_attributes,region_count,region_id,region_shape_attributes,region_attributes';
      csvdata.push(csvheader);

      for ( var image_id in _via_img_metadata ) {
        var fattr = map_to_json( _via_img_metadata[image_id].file_attributes );
        fattr = escape_for_csv( fattr );

        var prefix = '\n' + _via_img_metadata[image_id].filename;
        prefix += ',' + _via_img_metadata[image_id].size;
        prefix += ',"' + fattr + '"';

        var r = _via_img_metadata[image_id].regions;

        if ( r.length !==0 ) {
          for ( var i = 0; i < r.length; ++i ) {
            var csvline = [];
            csvline.push(prefix);
            csvline.push(r.length);
            csvline.push(i);

            var sattr = map_to_json( r[i].shape_attributes );
            sattr = '"' +  escape_for_csv( sattr ) + '"';
            csvline.push(sattr);

            var rattr = map_to_json( r[i].region_attributes );
            rattr = '"' +  escape_for_csv( rattr ) + '"';
            csvline.push(rattr);
            csvdata.push( csvline.join(VIA_CSV_SEP) );
          }
        } else {
          // @todo: reconsider this practice of adding an empty entry
          csvdata.push(prefix + ',0,0,"{}","{}"');
        }
      }
      ok_callback(csvdata);
    }

    // see http://cocodataset.org/#format-data
    if( return_type === 'coco' ) {
      img_stat_set_all().then( function(ok) {
        var coco = export_project_to_coco_format();
        ok_callback( [ coco ] );
      }.bind(this), function(err) {
        err_callback(err);
      }.bind(this));
    } else {
      // default format is JSON
      ok_callback( [ JSON.stringify(_via_img_metadata) ] );
    }
  }.bind(this));
}

function export_project_to_coco_format() {
  var coco = { 'info':{}, 'images':[], 'annotations':[], 'licenses':[], 'categories':[] };
  coco['info'] = { 'year': new Date().getFullYear(),
                   'version': '1.0',
                   'description': 'VIA project exported to COCO format using VGG Image Annotator (http://www.robots.ox.ac.uk/~vgg/software/via/)',
                   'contributor': '',
                   'url': 'http://www.robots.ox.ac.uk/~vgg/software/via/',
                   'date_created': new Date().toString(),
                 };
  coco['licenses'] = [ {'id':0, 'name':'Unknown License', 'url':''} ]; // indicates that license is unknown

  var skipped_annotation_count = 0;
  // We want to ensure that a COCO project imported in VIA and then exported again back to
  // COCO format using VIA retains the image_id and category_id present in the original COCO project.
  // A VIA project that has been created by importing annotations from a COCO project contains
  // unique image_id of type integer and contains all unique option id. If we detect this, we reuse
  // the existing image_id and category_id, otherwise we assign a new unique id sequentially.
  // Currently, it is not possible to preserve the annotation_id
  var assign_unique_id = false;
  for(var img_id in _via_img_metadata) {
    if(Number.isNaN(parseInt(img_id))) {
      assign_unique_id = true; // since COCO only supports image_id of type integer, we cannot reuse the VIA's image-id
      break;
    }
  }
  if(assign_unique_id) {
    // check if all the options have unique id
    var attribute_option_id_list = [];
    for(var attr_name in _via_attributes) {
      if( !VIA_COCO_EXPORT_ATTRIBUTE_TYPE.includes(_via_attributes[attr_name]['type']) ) {
        continue; // skip this attribute as it will not be included in COCO export
      }

      for(var attr_option_id in _via_attributes[attr_name]['options']) {
        if(attribute_option_id_list.includes(attr_option_id) ||
           Number.isNaN(parseInt(attr_option_id)) ) {
          assign_unique_id = true;
          break;
        } else {
          attribute_option_id_list.push(assign_unique_id);
        }
      }
    }
  }

  // add categories
  var attr_option_id_list = [];
  var attr_option_id_to_category_id = {};
  var unique_category_id = 1;
  for(var attr_name in _via_attributes['region']) {
    if( VIA_COCO_EXPORT_ATTRIBUTE_TYPE.includes(_via_attributes['region'][attr_name]['type']) ) {
      for(var attr_option_id in _via_attributes['region'][attr_name]['options']) {
        var category_id;
        if(assign_unique_id) {
          category_id = unique_category_id;
          unique_category_id = unique_category_id + 1;
        } else {
          category_id = parseInt(attr_option_id);
        }
        coco['categories'].push({
          'supercategory':attr_name,
          'id':category_id,
          'name':_via_attributes['region'][attr_name]['options'][attr_option_id]
        });
        attr_option_id_to_category_id[attr_option_id] = category_id;
      }
    }
  }

  // add files and all their associated annotations
  var annotation_id = 1;
  var unique_img_id = 1;
  for( var img_index in _via_image_id_list ) {
    var img_id = _via_image_id_list[img_index];
    var file_src = _via_settings['core']['default_filepath'] + _via_img_metadata[img_id].filename;
    if ( _via_img_fileref[img_id] instanceof File ) {
      file_src = _via_img_fileref[img_id].filename;
    }

    var coco_img_id;
    if(assign_unique_id) {
      coco_img_id = unique_img_id;
      unique_img_id = unique_img_id + 1;
    } else {
      coco_img_id = parseInt(img_id);
    }

    coco['images'].push( {
      'id':coco_img_id,
      'width':_via_img_stat[img_index][0],
      'height':_via_img_stat[img_index][1],
      'file_name':_via_img_metadata[img_id].filename,
      'license':0,
      'flickr_url':file_src,
      'coco_url':file_src,
      'date_captured':'',
    } );

    // add all annotations associated with this file
    for( var rindex in _via_img_metadata[img_id].regions ) {
      var region = _via_img_metadata[img_id].regions[rindex];
      if( !VIA_COCO_EXPORT_RSHAPE.includes(region.shape_attributes['name']) ) {
        skipped_annotation_count = skipped_annotation_count + 1;
        continue; // skip this region as COCO does not allow it
      }

      var coco_annotation = via_region_shape_to_coco_annotation(region.shape_attributes);
      coco_annotation['id'] = annotation_id;
      coco_annotation['image_id'] = coco_img_id;

      var region_aid_list = Object.keys(region['region_attributes']);
      for(var region_attribute_id in region['region_attributes']) {
        var region_attribute_value = region['region_attributes'][region_attribute_id];
        if(attr_option_id_to_category_id.hasOwnProperty(region_attribute_value)) {
          coco_annotation['category_id'] = attr_option_id_to_category_id[region_attribute_value];
          coco['annotations'].push(coco_annotation);
          annotation_id = annotation_id + 1;
        } else {
          skipped_annotation_count = skipped_annotation_count + 1;
          continue; // skip attribute value not supported by COCO format
        }
      }
    }
  }

  show_message('Skipped ' + skipped_annotation_count + ' annotations. COCO format only supports the following attribute types: ' + JSON.stringify(VIA_COCO_EXPORT_ATTRIBUTE_TYPE) + ' and region shapes: ' + JSON.stringify(VIA_COCO_EXPORT_RSHAPE));
  return [ JSON.stringify(coco) ];
}

function via_region_shape_to_coco_annotation(shape_attributes) {
  var annotation = { 'segmentation':[[]], 'area':[], 'bbox':[], 'iscrowd':0 };

  switch(shape_attributes['name']) {
  case 'rect':
    var x0 = shape_attributes['x'];
    var y0 = shape_attributes['y'];
    var w  = parseInt(shape_attributes['width']);
    var h  = parseInt(shape_attributes['height']);
    var x1 = x0 + w;
    var y1 = y0 + h;
    annotation['segmentation'][0] = [x0, y0, x1, y0, x1, y1, x0, y1];
    annotation['area'] =  w * h ;

    annotation['bbox'] = [x0, y0, w, h];
    break;

  case 'point':
    var cx = shape_attributes['cx'];
    var cy = shape_attributes['cy'];
    // 2 is for visibility - currently set to always inside segmentation.
    // see Keypoint Detection: http://cocodataset.org/#format-data
    annotation['keypoints'] = [cx, cy, 2];
    annotation['num_keypoints'] = 1;
    break;

  case 'circle':
    var a,b;
    a = shape_attributes['r'];
    b = shape_attributes['r'];
    var theta_to_radian = Math.PI/180;

    for ( var theta = 0; theta < 360; theta = theta + VIA_POLYGON_SEGMENT_SUBTENDED_ANGLE ) {
      var theta_radian = theta * theta_to_radian;
      var x = shape_attributes['cx'] + a * Math.cos(theta_radian);
      var y = shape_attributes['cy'] + b * Math.sin(theta_radian);
      annotation['segmentation'][0].push( fixfloat(x), fixfloat(y) );
    }
    annotation['bbox'] = polygon_to_bbox(annotation['segmentation'][0]);
    annotation['area'] = annotation['bbox'][2] * annotation['bbox'][3];
    break;

  case 'ellipse':
    var a,b;
    a = shape_attributes['rx'];
    b = shape_attributes['ry'];
    var rotation = 0;
    // older version of VIA2 did not support rotated ellipse and hence 'theta' attribute may not be available
    if( shape_attributes.hasOwnProperty('theta') ) {
      rotation = shape_attributes['theta'];
    }

    var theta_to_radian = Math.PI/180;

    for ( var theta = 0; theta < 360; theta = theta + VIA_POLYGON_SEGMENT_SUBTENDED_ANGLE ) {
      var theta_radian = theta * theta_to_radian;
      var x = shape_attributes['cx'] +
              ( a * Math.cos(theta_radian) * Math.cos(rotation) ) -
              ( b * Math.sin(theta_radian) * Math.sin(rotation) );
      var y = shape_attributes['cy'] +
              ( a * Math.cos(theta_radian) * Math.sin(rotation) ) +
              ( b * Math.sin(theta_radian) * Math.cos(rotation) );
      annotation['segmentation'][0].push( fixfloat(x), fixfloat(y) );
    }
    annotation['bbox'] = polygon_to_bbox(annotation['segmentation'][0]);
    annotation['area'] = annotation['bbox'][2] * annotation['bbox'][3];
    break;

  case 'polygon':
    annotation['segmentation'][0] = [];
    var x0 = +Infinity;
    var y0 = +Infinity;
    var x1 = -Infinity;
    var y1 = -Infinity;
    for ( var i in shape_attributes['all_points_x'] ) {
      annotation['segmentation'][0].push( shape_attributes['all_points_x'][i] );
      annotation['segmentation'][0].push( shape_attributes['all_points_y'][i] );
      if ( shape_attributes['all_points_x'][i] < x0 ) {
        x0 = shape_attributes['all_points_x'][i];
      }
      if ( shape_attributes['all_points_y'][i] < y0 ) {
        y0 = shape_attributes['all_points_y'][i];
      }
      if ( shape_attributes['all_points_x'][i] > x1 ) {
        x1 = shape_attributes['all_points_x'][i];
      }
      if ( shape_attributes['all_points_y'][i] > y1 ) {
        y1 = shape_attributes['all_points_y'][i];
      }
    }
    var w = x1 - x0;
    var h = y1 - y0;
    annotation['bbox'] = [x0, y0, w, h];
    annotation['area'] = w * h; // approximate area
  }
  return annotation;
}

function save_data_to_local_file(data, filename) {
  var a      = document.createElement('a');
  a.href     = URL.createObjectURL(data);
  a.download = filename;

  // simulate a mouse click event
  var event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  a.dispatchEvent(event);

  // @todo: replace a.dispatchEvent() with a.click()
  // a.click() based trigger is supported in Chrome 70 and Safari 11/12 but **not** in Firefox 63
  //a.click();
}

//
// Maintainers of user interface
//

