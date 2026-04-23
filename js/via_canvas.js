function init_message_panel() {
  var p = document.getElementById('message_panel');
  p.addEventListener('mousedown', function() {
    this.style.display = 'none';
  }, false);
  p.addEventListener('mouseover', function() {
    clearTimeout(_via_message_clear_timer); // stop any previous timeouts
  }, false);
}

function show_message(msg, t) {
  if ( _via_message_clear_timer ) {
    clearTimeout(_via_message_clear_timer); // stop any previous timeouts
  }
  var timeout = t;
  if ( typeof t === 'undefined' ) {
    timeout = VIA_THEME_MESSAGE_TIMEOUT_MS;
  }
  document.getElementById('message_panel_content').innerHTML = msg;
  document.getElementById('message_panel').style.display = 'block';

  _via_message_clear_timer = setTimeout( function() {
    document.getElementById('message_panel').style.display = 'none';
  }, timeout);
}

function _via_regions_group_color_init() {
  _via_canvas_regions_group_color = {};
  var aid = _via_settings.ui.image.region_color;
  if ( aid !== '__via_default_region_color__' ) {
    var avalue;
    for ( var i = 0; i < _via_img_metadata[_via_image_id].regions.length; ++i ) {
      avalue = _via_img_metadata[_via_image_id].regions[i].region_attributes[aid];
      _via_canvas_regions_group_color[avalue] = 1;
    }
    var color_index = 0;
    for ( avalue in _via_canvas_regions_group_color ) {
      _via_canvas_regions_group_color[avalue] = VIA_REGION_COLOR_LIST[ color_index % VIA_REGION_COLOR_LIST.length ];
      color_index = color_index + 1;
    }
  }
}

// transform regions in image space to canvas space
function _via_load_canvas_regions() {
  _via_regions_group_color_init();

  // load all existing annotations into _via_canvas_regions
  var regions = _via_img_metadata[_via_image_id].regions;
  _via_canvas_regions  = [];
  for ( var i = 0; i < regions.length; ++i ) {
    var region_i = new file_region();
    for ( var key in regions[i].shape_attributes ) {
      region_i.shape_attributes[key] = regions[i].shape_attributes[key];
    }
    _via_canvas_regions.push(region_i);

    switch(_via_canvas_regions[i].shape_attributes['name']) {
    case VIA_REGION_SHAPE.RECT:
      var x      = regions[i].shape_attributes['x'] / _via_canvas_scale;
      var y      = regions[i].shape_attributes['y'] / _via_canvas_scale;
      var width  = regions[i].shape_attributes['width']  / _via_canvas_scale;
      var height = regions[i].shape_attributes['height'] / _via_canvas_scale;

      _via_canvas_regions[i].shape_attributes['x'] = Math.round(x);
      _via_canvas_regions[i].shape_attributes['y'] = Math.round(y);
      _via_canvas_regions[i].shape_attributes['width'] = Math.round(width);
      _via_canvas_regions[i].shape_attributes['height'] = Math.round(height);
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
      var r  = regions[i].shape_attributes['r']  / _via_canvas_scale;
      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      _via_canvas_regions[i].shape_attributes['r'] = Math.round(r);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
      var rx = regions[i].shape_attributes['rx'] / _via_canvas_scale;
      var ry = regions[i].shape_attributes['ry'] / _via_canvas_scale;
      // rotation in radians
      var theta = regions[i].shape_attributes['theta'];
      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      _via_canvas_regions[i].shape_attributes['rx'] = Math.round(rx);
      _via_canvas_regions[i].shape_attributes['ry'] = Math.round(ry);
      _via_canvas_regions[i].shape_attributes['theta'] = theta;
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      var all_points_x = regions[i].shape_attributes['all_points_x'].slice(0);
      var all_points_y = regions[i].shape_attributes['all_points_y'].slice(0);
      for (var j=0; j<all_points_x.length; ++j) {
        all_points_x[j] = Math.round(all_points_x[j] / _via_canvas_scale);
        all_points_y[j] = Math.round(all_points_y[j] / _via_canvas_scale);
      }
      _via_canvas_regions[i].shape_attributes['all_points_x'] = all_points_x;
      _via_canvas_regions[i].shape_attributes['all_points_y'] = all_points_y;
      break;

    case VIA_REGION_SHAPE.POINT:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;

      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      break;
    }
  }
}

// updates currently selected region shape
function select_region_shape(sel_shape_name) {
  for ( var shape_name in VIA_REGION_SHAPE ) {
    var ui_element = document.getElementById('region_shape_' + VIA_REGION_SHAPE[shape_name]);
    ui_element.classList.remove('selected');
  }

  _via_current_shape = sel_shape_name;
  var ui_element = document.getElementById('region_shape_' + _via_current_shape);
  ui_element.classList.add('selected');

  switch(_via_current_shape) {
  case VIA_REGION_SHAPE.RECT: // Fall-through
  case VIA_REGION_SHAPE.CIRCLE: // Fall-through
  case VIA_REGION_SHAPE.ELLIPSE:
    show_message('Press single click and drag mouse to draw ' +
                 _via_current_shape + ' region');
    break;

  case VIA_REGION_SHAPE.POLYLINE:
  case VIA_REGION_SHAPE.POLYGON:
    _via_is_user_drawing_polygon = false;
    _via_current_polygon_region_id = -1;

    show_message('[Single Click] to define polygon/polyline vertices, ' +
                 '[Backspace] to delete last vertex, [Enter] to finish, [Esc] to cancel drawing.' );
    break;

  case VIA_REGION_SHAPE.POINT:
    show_message('Press single click to define points (or landmarks)');
    break;

  default:
    show_message('Unknown shape selected!');
    break;
  }
}

function set_all_canvas_size(w, h) {
  _via_reg_canvas.height = h + 2 * _via_reg_canvas_margin;
  _via_reg_canvas.width = w + 2 * _via_reg_canvas_margin;
  _via_reg_canvas.style.top = '0px';
  _via_reg_canvas.style.left = '0px';

  image_panel.style.height = (h + 2 * _via_reg_canvas_margin) + 'px';
  image_panel.style.width  = (w + 2 * _via_reg_canvas_margin) + 'px';
  image_panel.style.setProperty('--via-image-offset-x', _via_reg_canvas_margin + 'px');
  image_panel.style.setProperty('--via-image-offset-y', _via_reg_canvas_margin + 'px');
  image_panel.style.setProperty('--via-image-width', w + 'px');
  image_panel.style.setProperty('--via-image-height', h + 'px');
}

function _via_get_normalized_event_position(e) {
  return {
    x: e.offsetX - _via_reg_canvas_margin,
    y: e.offsetY - _via_reg_canvas_margin,
  };
}

function _via_canvas_offset_x(x) {
  return x + _via_reg_canvas_margin;
}

function _via_canvas_offset_y(y) {
  return y + _via_reg_canvas_margin;
}

function _via_is_inside_image(x, y) {
  return x >= 0 && y >= 0 && x <= _via_canvas_width && y <= _via_canvas_height;
}

function _via_can_start_outside_image(shape) {
  return shape === VIA_REGION_SHAPE.POINT ||
         shape === VIA_REGION_SHAPE.POLYGON ||
         shape === VIA_REGION_SHAPE.POLYLINE;
}

function _via_log_click_debug(stage, details) {
  if ( !VIA_CLICK_DEBUG_LOG ) {
    return;
  }
  console.log('[via-click]', stage, details);
}

function set_all_canvas_scale(s) {
  _via_reg_ctx.scale(s, s);
}

function show_all_canvas() {
  image_panel.style.display = 'inline-block';
}

function hide_all_canvas() {
  image_panel.style.display = 'none';
}

function jump_to_image(image_index) {
  if ( _via_img_count <= 0 ) {
    return;
  }

  switch(_via_display_area_content_name) {
  case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID:
    if ( image_index >= 0 && image_index < _via_img_count) {
      // @todo: jump to image grid page view with the given first image index
      show_single_image_view();
      _via_show_img(image_index);
    }
    break;
  default:
    if ( image_index >= 0 && image_index < _via_img_count) {
      _via_show_img(image_index);
    }
    break;
  }
}

function count_missing_region_attr(img_id) {
  var miss_region_attr_count = 0;
  var attr_count = Object.keys(_via_region_attributes).length;
  for( var i=0; i < _via_img_metadata[img_id].regions.length; ++i ) {
    var set_attr_count = Object.keys(_via_img_metadata[img_id].regions[i].region_attributes).length;
    miss_region_attr_count += ( attr_count - set_attr_count );
  }
  return miss_region_attr_count;
}

function count_missing_file_attr(img_id) {
  return Object.keys(_via_file_attributes).length - Object.keys(_via_img_metadata[img_id].file_attributes).length;
}

function toggle_all_regions_selection(is_selected) {
  var n = _via_img_metadata[_via_image_id].regions.length;
  var i;
  _via_region_selected_flag = [];
  for ( i = 0; i < n; ++i) {
    _via_region_selected_flag[i] = is_selected;
  }
  _via_is_all_region_selected = is_selected;
  annotation_editor_hide();
  if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.ALL_REGIONS ) {
    annotation_editor_clear_row_highlight();
  }
}

function select_only_region(region_id) {
  toggle_all_regions_selection(false);
  set_region_select_state(region_id, true);
  _via_is_region_selected = true;
  _via_is_all_region_selected = false;
  _via_user_sel_region_id = region_id;
}

function set_region_select_state(region_id, is_selected) {
  _via_region_selected_flag[region_id] = is_selected;
}

function show_annotation_data() {
  pack_via_metadata('csv').then( function(data) {
    var hstr = '<pre>' + data.join('') + '</pre>';
    var window_features = 'toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no';
    window_features += ',width=800,height=600';
    var annotation_data_window = window.open('', 'Annotations (preview) ', window_features);
    annotation_data_window.document.body.innerHTML = hstr;
  }.bind(this), function(err) {
    show_message('Failed to collect annotation data!');
  }.bind(this));
}

//
// Image click handlers
//

// enter annotation mode on double click
function _via_reg_canvas_dblclick_handler(e) {
  e.stopPropagation();
  // @todo: use double click in future
}

// user clicks on the canvas
function _via_reg_canvas_mousedown_handler(e) {
  e.stopPropagation();
  var normalized_position = _via_get_normalized_event_position(e);
  _via_click_x0 = normalized_position.x; _via_click_y0 = normalized_position.y;
  _via_region_edge = is_on_region_corner(_via_click_x0, _via_click_y0);
  var region_id = is_inside_region(_via_click_x0, _via_click_y0);
  var is_click_inside_image = _via_is_inside_image(_via_click_x0, _via_click_y0);

  _via_log_click_debug('mousedown', {
    shape:_via_current_shape,
    x:_via_click_x0,
    y:_via_click_y0,
    insideImage:is_click_inside_image,
    regionId:region_id,
    selectedRegion:_via_user_sel_region_id,
    isRegionSelected:_via_is_region_selected,
    isDrawingPolygon:_via_is_user_drawing_polygon,
    edge:_via_region_edge
  });

  if ( _via_is_region_selected ) {
    // check if user clicked on the region boundary
    if ( _via_region_edge[1] > 0 ) {
      if ( !_via_is_user_resizing_region ) {
        if ( _via_region_edge[0] !== _via_user_sel_region_id ) {
          _via_user_sel_region_id = _via_region_edge[0];
        }
        // resize region
        _via_is_user_resizing_region = true;
        _via_log_click_debug('mousedown-select-resize', {
          regionId:_via_user_sel_region_id,
          edge:_via_region_edge
        });
      }
    } else {
      var yes = is_inside_this_region(_via_click_x0,
                                      _via_click_y0,
                                      _via_user_sel_region_id);
      if (yes) {
        if( !_via_is_user_moving_region ) {
          _via_is_user_moving_region = true;
          _via_region_click_x = _via_click_x0;
          _via_region_click_y = _via_click_y0;
          _via_log_click_debug('mousedown-select-move', {
            regionId:_via_user_sel_region_id,
            x:_via_region_click_x,
            y:_via_region_click_y
          });
        }
      }
      if ( region_id === -1 ) {
        // mousedown on outside any region
        _via_is_user_drawing_region = !_via_can_start_outside_image(_via_current_shape) &&
                                      is_click_inside_image;
        _via_log_click_debug('mousedown-clear-selection', {
          shape:_via_current_shape,
          drawingRegion:_via_is_user_drawing_region,
          insideImage:is_click_inside_image
        });
        // unselect all regions
        _via_is_region_selected = false;
        _via_user_sel_region_id = -1;
        toggle_all_regions_selection(false);
      }
    }
  } else {
    if ( region_id === -1 ) {
      // mousedown outside a region
      if ( !is_click_inside_image && !_via_can_start_outside_image(_via_current_shape) ) {
        _via_is_user_drawing_region = false;
        _via_log_click_debug('mousedown-ignored-outside-image', {
          shape:_via_current_shape,
          x:_via_click_x0,
          y:_via_click_y0
        });
        return;
      }
      if (_via_current_shape !== VIA_REGION_SHAPE.POLYGON &&
          _via_current_shape !== VIA_REGION_SHAPE.POLYLINE &&
          _via_current_shape !== VIA_REGION_SHAPE.POINT) {
        // this is a bounding box drawing event
        _via_is_user_drawing_region = true;
        _via_log_click_debug('mousedown-start-drag-shape', {
          shape:_via_current_shape,
          x:_via_click_x0,
          y:_via_click_y0
        });
      }
    } else {
      // mousedown inside a region
      // this could lead to (1) region selection or (2) region drawing
      _via_is_user_drawing_region = true;
      _via_log_click_debug('mousedown-inside-region', {
        shape:_via_current_shape,
        regionId:region_id,
        drawingRegion:true
      });
    }
  }
}

// implements the following functionalities:
//  - new region drawing (including polygon)
//  - moving/resizing/select/unselect existing region
function _via_reg_canvas_mouseup_handler(e) {
  e.stopPropagation();
  var normalized_position = _via_get_normalized_event_position(e);
  _via_click_x1 = normalized_position.x; _via_click_y1 = normalized_position.y;

  var click_dx = Math.abs(_via_click_x1 - _via_click_x0);
  var click_dy = Math.abs(_via_click_y1 - _via_click_y0);
  var click_tol = VIA_MOUSE_CLICK_TOL;
  if ( _via_is_user_drawing_polygon ||
       _via_current_shape === VIA_REGION_SHAPE.POLYGON ||
       _via_current_shape === VIA_REGION_SHAPE.POLYLINE ) {
    click_tol = VIA_POLYGON_MOUSE_CLICK_TOL;
  }

  _via_log_click_debug('mouseup', {
    shape:_via_current_shape,
    x0:_via_click_x0,
    y0:_via_click_y0,
    x1:_via_click_x1,
    y1:_via_click_y1,
    dx:click_dx,
    dy:click_dy,
    clickTolerance:click_tol,
    isDrawingRegion:_via_is_user_drawing_region,
    isDrawingPolygon:_via_is_user_drawing_polygon,
    isMovingRegion:_via_is_user_moving_region,
    isResizingRegion:_via_is_user_resizing_region
  });

  // indicates that user has finished moving a region
  if ( _via_is_user_moving_region ) {
    _via_is_user_moving_region = false;
    _via_reg_canvas.style.cursor = "default";

    var move_x = Math.round(_via_click_x1 - _via_region_click_x);
    var move_y = Math.round(_via_click_y1 - _via_region_click_y);

    if (Math.abs(move_x) > VIA_MOUSE_CLICK_TOL ||
        Math.abs(move_y) > VIA_MOUSE_CLICK_TOL) {
      // move all selected regions
      _via_log_click_debug('mouseup-move-selected-regions', {
        moveX:move_x,
        moveY:move_y
      });
      _via_move_selected_regions(move_x, move_y);
    } else {
      // indicates a user click on an already selected region
      // this could indicate the user's intention to select another
      // nested region within this region
      // OR
      // draw a nested region (i.e. region inside a region)

      // traverse the canvas regions in alternating ascending
      // and descending order to solve the issue of nested regions
      var nested_region_id = is_inside_region(_via_click_x0, _via_click_y0, true);
      if (nested_region_id >= 0 &&
          nested_region_id !== _via_user_sel_region_id) {
        _via_user_sel_region_id = nested_region_id;
        _via_is_region_selected = true;
        _via_is_user_moving_region = false;

        // de-select all other regions if the user has not pressed Shift
        if ( !e.shiftKey ) {
          toggle_all_regions_selection(false);
        }
        set_region_select_state(nested_region_id, true);
        annotation_editor_show();
        _via_log_click_debug('mouseup-select-nested-region', {
          regionId:nested_region_id
        });
      } else {
        // user clicking inside an already selected region
        // indicates that the user intends to draw a nested region
        toggle_all_regions_selection(false);
        _via_is_region_selected = false;

        switch (_via_current_shape) {
        case VIA_REGION_SHAPE.POLYLINE: // handled by case for POLYGON
        case VIA_REGION_SHAPE.POLYGON:
          // user has clicked on the first point in a new polygon
          // see also event 'mouseup' for _via_is_user_drawing_polygon=true
          _via_is_user_drawing_polygon = true;

          var canvas_polygon_region = new file_region();
          canvas_polygon_region.shape_attributes['name'] = _via_current_shape;
          canvas_polygon_region.shape_attributes['all_points_x'] = [Math.round(_via_click_x0)];
          canvas_polygon_region.shape_attributes['all_points_y'] = [Math.round(_via_click_y0)];
          var new_length = _via_canvas_regions.push(canvas_polygon_region);
          _via_current_polygon_region_id = new_length - 1;
          _via_log_click_debug('mouseup-start-polygon-from-selection', {
            shape:_via_current_shape,
            regionId:_via_current_polygon_region_id,
            x:_via_click_x0,
            y:_via_click_y0
          });
          break;

        case VIA_REGION_SHAPE.POINT:
          // user has marked a landmark point
          var point_region = new file_region();
          point_region.shape_attributes['name'] = VIA_REGION_SHAPE.POINT;
          point_region.shape_attributes['cx'] = Math.round(_via_click_x0 * _via_canvas_scale);
          point_region.shape_attributes['cy'] = Math.round(_via_click_y0 * _via_canvas_scale);
          _via_img_metadata[_via_image_id].regions.push(point_region);

          var canvas_point_region = new file_region();
          canvas_point_region.shape_attributes['name'] = VIA_REGION_SHAPE.POINT;
          canvas_point_region.shape_attributes['cx'] = Math.round(_via_click_x0);
          canvas_point_region.shape_attributes['cy'] = Math.round(_via_click_y0);
          _via_canvas_regions.push(canvas_point_region);
          _via_log_click_debug('mouseup-create-point-from-selection', {
            x:_via_click_x0,
            y:_via_click_y0
          });
          break;
        }
        annotation_editor_update_content();
      }
    }
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
    return;
  }

  // indicates that user has finished resizing a region
  if ( _via_is_user_resizing_region ) {
    // _via_click(x0,y0) to _via_click(x1,y1)
    _via_is_user_resizing_region = false;
    _via_reg_canvas.style.cursor = "default";

    // update the region
    var region_id = _via_region_edge[0];
    var image_attr = _via_img_metadata[_via_image_id].regions[region_id].shape_attributes;
    var canvas_attr = _via_canvas_regions[region_id].shape_attributes;

    switch (canvas_attr['name']) {
    case VIA_REGION_SHAPE.RECT:
      var d = [canvas_attr['x'], canvas_attr['y'], 0, 0];
      d[2] = d[0] + canvas_attr['width'];
      d[3] = d[1] + canvas_attr['height'];

      var mx = _via_current_x;
      var my = _via_current_y;
      var preserve_aspect_ratio = false;

      // constrain (mx,my) to lie on a line connecting a diagonal of rectangle
      if ( _via_is_ctrl_pressed ) {
        preserve_aspect_ratio = true;
      }

      rect_update_corner(_via_region_edge[1], d, mx, my, preserve_aspect_ratio);
      rect_standardize_coordinates(d);

      var w = Math.abs(d[2] - d[0]);
      var h = Math.abs(d[3] - d[1]);

      image_attr['x'] = Math.round(d[0] * _via_canvas_scale);
      image_attr['y'] = Math.round(d[1] * _via_canvas_scale);
      image_attr['width'] = Math.round(w * _via_canvas_scale);
      image_attr['height'] = Math.round(h * _via_canvas_scale);

      canvas_attr['x'] = Math.round( image_attr['x'] / _via_canvas_scale);
      canvas_attr['y'] = Math.round( image_attr['y'] / _via_canvas_scale);
      canvas_attr['width'] = Math.round( image_attr['width'] / _via_canvas_scale);
      canvas_attr['height'] = Math.round( image_attr['height'] / _via_canvas_scale);
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      var dx = Math.abs(canvas_attr['cx'] - _via_current_x);
      var dy = Math.abs(canvas_attr['cy'] - _via_current_y);
      var new_r = Math.sqrt( dx*dx + dy*dy );

      image_attr['r'] = fixfloat(new_r * _via_canvas_scale);
      canvas_attr['r'] = Math.round( image_attr['r'] / _via_canvas_scale);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      var new_rx = canvas_attr['rx'];
      var new_ry = canvas_attr['ry'];
      var new_theta = canvas_attr['theta'];
      var dx = Math.abs(canvas_attr['cx'] - _via_current_x);
      var dy = Math.abs(canvas_attr['cy'] - _via_current_y);

      switch(_via_region_edge[1]) {
      case 5:
        new_ry = Math.sqrt(dx*dx + dy*dy);
        new_theta = Math.atan2(- (_via_current_x - canvas_attr['cx']), (_via_current_y - canvas_attr['cy']));
        break;

      case 6:
        new_rx = Math.sqrt(dx*dx + dy*dy);
        new_theta = Math.atan2((_via_current_y - canvas_attr['cy']), (_via_current_x - canvas_attr['cx']));
        break;

      default:
        new_rx = dx;
        new_ry = dy;
        new_theta = 0;
        break;
      }

      image_attr['rx'] = fixfloat(new_rx * _via_canvas_scale);
      image_attr['ry'] = fixfloat(new_ry * _via_canvas_scale);
      image_attr['theta'] = fixfloat(new_theta);

      canvas_attr['rx'] = Math.round(image_attr['rx'] / _via_canvas_scale);
      canvas_attr['ry'] = Math.round(image_attr['ry'] / _via_canvas_scale);
      canvas_attr['theta'] = fixfloat(new_theta);
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      var moved_vertex_id = _via_region_edge[1] - VIA_POLYGON_RESIZE_VERTEX_OFFSET;

      if ( e.ctrlKey ) {
        // if on vertex, delete it
        // if on edge, add a new vertex
        var r = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
        var shape = r.name;
        var click_x = Math.round(_via_click_x1);
        var click_y = Math.round(_via_click_y1);
        var is_on_vertex = is_on_polygon_vertex(r['all_points_x'], r['all_points_y'], click_x, click_y);

        if ( is_on_vertex === _via_region_edge[1] ) {
          // click on vertex, hence delete vertex
          if ( _via_polygon_del_vertex(region_id, moved_vertex_id) ) {
            show_message('Deleted vertex ' + moved_vertex_id + ' from region');
          }
        } else {
          var is_on_edge = is_on_polygon_edge(r['all_points_x'], r['all_points_y'], click_x, click_y);
          if ( is_on_edge === _via_region_edge[1] ) {
            // click on edge, hence add new vertex
            var vertex_index = is_on_edge - VIA_POLYGON_RESIZE_VERTEX_OFFSET;
            var canvas_x0 = click_x;
            var canvas_y0 = click_y;
            var img_x0 = Math.round( canvas_x0 * _via_canvas_scale );
            var img_y0 = Math.round( canvas_y0 * _via_canvas_scale );
            canvas_x0 = Math.round( img_x0 / _via_canvas_scale );
            canvas_y0 = Math.round( img_y0 / _via_canvas_scale );

            _via_canvas_regions[region_id].shape_attributes['all_points_x'].splice(vertex_index+1, 0, canvas_x0);
            _via_canvas_regions[region_id].shape_attributes['all_points_y'].splice(vertex_index+1, 0, canvas_y0);
            _via_img_metadata[_via_image_id].regions[region_id].shape_attributes['all_points_x'].splice(vertex_index+1, 0, img_x0);
            _via_img_metadata[_via_image_id].regions[region_id].shape_attributes['all_points_y'].splice(vertex_index+1, 0, img_y0);

            show_message('Added 1 new vertex to ' + shape + ' region');
          }
        }
      } else {
        // update coordinate of vertex
        var imx = Math.round(_via_current_x * _via_canvas_scale);
        var imy = Math.round(_via_current_y * _via_canvas_scale);
        image_attr['all_points_x'][moved_vertex_id] = imx;
        image_attr['all_points_y'][moved_vertex_id] = imy;
        canvas_attr['all_points_x'][moved_vertex_id] = Math.round( imx / _via_canvas_scale );
        canvas_attr['all_points_y'][moved_vertex_id] = Math.round( imy / _via_canvas_scale );
      }
      break;
    } // end of switch()
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
    return;
  }

  // denotes a single click (= mouse down + mouse up)
    if ( click_dx < click_tol &&
      click_dy < click_tol ) {
    // if user is already drawing polygon, then each click adds a new point
    if ( _via_is_user_drawing_polygon ) {
      var canvas_x0 = Math.round(_via_click_x1);
      var canvas_y0 = Math.round(_via_click_y1);
      var n = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].length;
      var last_x0 = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'][n-1];
      var last_y0 = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'][n-1];
      // discard if the click was on the last vertex
      if ( canvas_x0 !== last_x0 || canvas_y0 !== last_y0 ) {
        // user clicked on a new polygon point
        _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].push(canvas_x0);
        _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'].push(canvas_y0);
        _via_log_click_debug('mouseup-add-polygon-vertex', {
          regionId:_via_current_polygon_region_id,
          x:canvas_x0,
          y:canvas_y0,
          vertexCount:_via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].length
        });
      } else {
        _via_log_click_debug('mouseup-ignore-duplicate-polygon-vertex', {
          regionId:_via_current_polygon_region_id,
          x:canvas_x0,
          y:canvas_y0
        });
      }
    } else {
      var region_id = is_inside_region(_via_click_x0, _via_click_y0);
      if ( region_id >= 0 ) {
        // first click selects region
        _via_user_sel_region_id     = region_id;
        _via_is_region_selected     = true;
        _via_is_user_moving_region  = false;
        _via_is_user_drawing_region = false;

        // de-select all other regions if the user has not pressed Shift
        if ( !e.shiftKey ) {
          annotation_editor_clear_row_highlight();
          toggle_all_regions_selection(false);
        }
        set_region_select_state(region_id, true);

        // show annotation editor only when a single region is selected
        if ( !e.shiftKey ) {
          annotation_editor_show();
        } else {
          annotation_editor_hide();
        }

        // show the region info
        if (_via_is_region_info_visible) {
          var canvas_attr = _via_canvas_regions[region_id].shape_attributes;

          switch (canvas_attr['name']) {
          case VIA_REGION_SHAPE.RECT:
            break;

          case VIA_REGION_SHAPE.CIRCLE:
            var rf = document.getElementById('region_info');
            var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
            rf.innerHTML +=  ',' + ' Radius:' + attr['r'];
            break;

          case VIA_REGION_SHAPE.ELLIPSE:
            var rf = document.getElementById('region_info');
            var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
            rf.innerHTML +=  ',' + ' X-radius:' + attr['rx'] + ',' + ' Y-radius:' + attr['ry'];
            break;

          case VIA_REGION_SHAPE.POLYLINE:
          case VIA_REGION_SHAPE.POLYGON:
            break;
          }
        }

        show_message('Region selected. If you intended to draw a region, click again inside the selected region to start drawing a region.')
        _via_log_click_debug('mouseup-select-region', {
          regionId:region_id,
          shiftKey:e.shiftKey
        });
      } else {
        if ( !_via_is_inside_image(_via_click_x0, _via_click_y0) &&
             !_via_can_start_outside_image(_via_current_shape) ) {
          _via_log_click_debug('mouseup-ignored-outside-image', {
            shape:_via_current_shape,
            x:_via_click_x0,
            y:_via_click_y0
          });
          _via_redraw_reg_canvas();
          _via_reg_canvas.focus();
          return;
        }
        if ( _via_is_user_drawing_region ) {
          // clear all region selection
          _via_is_user_drawing_region = false;
          _via_is_region_selected     = false;
          toggle_all_regions_selection(false);
          annotation_editor_hide();
          _via_log_click_debug('mouseup-clear-region-selection', {
            x:_via_click_x0,
            y:_via_click_y0
          });
        } else {
          switch (_via_current_shape) {
          case VIA_REGION_SHAPE.POLYLINE: // handled by case for POLYGON
          case VIA_REGION_SHAPE.POLYGON:
            // user has clicked on the first point in a new polygon
            // see also event 'mouseup' for _via_is_user_moving_region=true
            _via_is_user_drawing_polygon = true;

            var canvas_polygon_region = new file_region();
            canvas_polygon_region.shape_attributes['name'] = _via_current_shape;
            canvas_polygon_region.shape_attributes['all_points_x'] = [ Math.round(_via_click_x0) ];
            canvas_polygon_region.shape_attributes['all_points_y'] = [ Math.round(_via_click_y0)] ;

            var new_length = _via_canvas_regions.push(canvas_polygon_region);
            _via_current_polygon_region_id = new_length - 1;
            _via_log_click_debug('mouseup-start-polygon', {
              shape:_via_current_shape,
              regionId:_via_current_polygon_region_id,
              x:_via_click_x0,
              y:_via_click_y0,
              insideImage:_via_is_inside_image(_via_click_x0, _via_click_y0)
            });
            break;

          case VIA_REGION_SHAPE.POINT:
            // user has marked a landmark point
            var point_region = new file_region();
            point_region.shape_attributes['name'] = VIA_REGION_SHAPE.POINT;
            point_region.shape_attributes['cx'] = Math.round(_via_click_x0 * _via_canvas_scale);
            point_region.shape_attributes['cy'] = Math.round(_via_click_y0 * _via_canvas_scale);
            _via_img_metadata[_via_image_id].regions.push(point_region);

            var canvas_point_region = new file_region();
            canvas_point_region.shape_attributes['name'] = VIA_REGION_SHAPE.POINT;
            canvas_point_region.shape_attributes['cx'] = Math.round(_via_click_x0);
            canvas_point_region.shape_attributes['cy'] = Math.round(_via_click_y0);
            _via_canvas_regions.push(canvas_point_region);

            annotation_editor_update_content();
            _via_log_click_debug('mouseup-create-point', {
              x:_via_click_x0,
              y:_via_click_y0,
              insideImage:_via_is_inside_image(_via_click_x0, _via_click_y0)
            });
            break;
          }
        }
      }
    }
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
    return;
  }

  if ( _via_is_user_drawing_polygon ) {
    _via_log_click_debug('mouseup-ignore-polygon-click-over-tolerance', {
      dx:click_dx,
      dy:click_dy,
      clickTolerance:click_tol,
      x0:_via_click_x0,
      y0:_via_click_y0,
      x1:_via_click_x1,
      y1:_via_click_y1
    });
  }

  // indicates that user has finished drawing a new region
  if ( _via_is_user_drawing_region ) {
    _via_is_user_drawing_region = false;
    var region_x0 = _via_click_x0;
    var region_y0 = _via_click_y0;
    var region_x1 = _via_click_x1;
    var region_y1 = _via_click_y1;

    var original_img_region = new file_region();
    var canvas_img_region = new file_region();
    var region_dx = Math.abs(region_x1 - region_x0);
    var region_dy = Math.abs(region_y1 - region_y0);
    var new_region_added = false;

    if ( true ) { 
      switch(_via_current_shape) {
      case VIA_REGION_SHAPE.RECT:
        // ensure that (x0,y0) is top-left and (x1,y1) is bottom-right
        if ( _via_click_x0 < _via_click_x1 ) {
          region_x0 = _via_click_x0;
          region_x1 = _via_click_x1;
        } else {
          region_x0 = _via_click_x1;
          region_x1 = _via_click_x0;
        }

        if ( _via_click_y0 < _via_click_y1 ) {
          region_y0 = _via_click_y0;
          region_y1 = _via_click_y1;
        } else {
          region_y0 = _via_click_y1;
          region_y1 = _via_click_y0;
        }

        var x = Math.round(region_x0 * _via_canvas_scale);
        var y = Math.round(region_y0 * _via_canvas_scale);
        var width  = Math.round(region_dx * _via_canvas_scale);
        var height = Math.round(region_dy * _via_canvas_scale);
        original_img_region.shape_attributes['name'] = 'rect';
        original_img_region.shape_attributes['x'] = x;
        original_img_region.shape_attributes['y'] = y;
        original_img_region.shape_attributes['width'] = width;
        original_img_region.shape_attributes['height'] = height;

        canvas_img_region.shape_attributes['name'] = 'rect';
        canvas_img_region.shape_attributes['x'] = Math.round( x / _via_canvas_scale );
        canvas_img_region.shape_attributes['y'] = Math.round( y / _via_canvas_scale );
        canvas_img_region.shape_attributes['width'] = Math.round( width / _via_canvas_scale );
        canvas_img_region.shape_attributes['height'] = Math.round( height / _via_canvas_scale );

        new_region_added = true;
        break;

      case VIA_REGION_SHAPE.CIRCLE:
        var cx = Math.round(region_x0 * _via_canvas_scale);
        var cy = Math.round(region_y0 * _via_canvas_scale);
        var r  = Math.round( Math.sqrt(region_dx*region_dx + region_dy*region_dy) * _via_canvas_scale );

        original_img_region.shape_attributes['name'] = 'circle';
        original_img_region.shape_attributes['cx'] = cx;
        original_img_region.shape_attributes['cy'] = cy;
        original_img_region.shape_attributes['r'] = r;

        canvas_img_region.shape_attributes['name'] = 'circle';
        canvas_img_region.shape_attributes['cx'] = Math.round( cx / _via_canvas_scale );
        canvas_img_region.shape_attributes['cy'] = Math.round( cy / _via_canvas_scale );
        canvas_img_region.shape_attributes['r'] = Math.round( r / _via_canvas_scale );

        new_region_added = true;
        break;

      case VIA_REGION_SHAPE.ELLIPSE:
        var cx = Math.round(region_x0 * _via_canvas_scale);
        var cy = Math.round(region_y0 * _via_canvas_scale);
        var rx = Math.round(region_dx * _via_canvas_scale);
        var ry = Math.round(region_dy * _via_canvas_scale);
        var theta = 0;

        original_img_region.shape_attributes['name'] = 'ellipse';
        original_img_region.shape_attributes['cx'] = cx;
        original_img_region.shape_attributes['cy'] = cy;
        original_img_region.shape_attributes['rx'] = rx;
        original_img_region.shape_attributes['ry'] = ry;
        original_img_region.shape_attributes['theta'] = theta;

        canvas_img_region.shape_attributes['name'] = 'ellipse';
        canvas_img_region.shape_attributes['cx'] = Math.round( cx / _via_canvas_scale );
        canvas_img_region.shape_attributes['cy'] = Math.round( cy / _via_canvas_scale );
        canvas_img_region.shape_attributes['rx'] = Math.round( rx / _via_canvas_scale );
        canvas_img_region.shape_attributes['ry'] = Math.round( ry / _via_canvas_scale );
        canvas_img_region.shape_attributes['theta'] = theta;

        new_region_added = true;
        break;

      case VIA_REGION_SHAPE.POINT:    // handled by case VIA_REGION_SHAPE.POLYGON
      case VIA_REGION_SHAPE.POLYLINE: // handled by case VIA_REGION_SHAPE.POLYGON
      case VIA_REGION_SHAPE.POLYGON:
        // handled by _via_is_user_drawing_polygon
        break;
      } // end of switch

      if ( new_region_added ) {
        var n1 = _via_img_metadata[_via_image_id].regions.push(original_img_region);
        var n2 = _via_canvas_regions.push(canvas_img_region);

        if ( n1 !== n2 ) {
          console.log('_via_img_metadata.regions[' + n1 + '] and _via_canvas_regions[' + n2 + '] count mismatch');
        }
        var new_region_id = n1 - 1;

        set_region_annotations_to_default_value( new_region_id );
        select_only_region(new_region_id);
        if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.ALL_REGIONS &&
             _via_metadata_being_updated === 'region' ) {
          annotation_editor_add_row( new_region_id );
          annotation_editor_scroll_to_row( new_region_id );
          annotation_editor_clear_row_highlight();
          annotation_editor_highlight_row( new_region_id );
        }
        annotation_editor_show();
      }
      _via_redraw_reg_canvas();
      _via_reg_canvas.focus();
    } else {
      show_message('Prevented accidental addition of a very small region.');
    }
    return;
  }
}

function _via_reg_canvas_mouseover_handler(e) {
  // change the mouse cursor icon
  _via_redraw_reg_canvas();
  _via_reg_canvas.focus();
}

function _via_reg_canvas_mousemove_handler(e) {
  if ( !_via_current_image_loaded ) {
    return;
  }

  var normalized_position = _via_get_normalized_event_position(e);
  _via_current_x = normalized_position.x; _via_current_y = normalized_position.y;

  // display the cursor coordinates
  var rf = document.getElementById('region_info');
  if ( rf != null && _via_is_region_info_visible ) {
    var img_x = Math.round( _via_current_x * _via_canvas_scale );
    var img_y = Math.round( _via_current_y * _via_canvas_scale );
    rf.innerHTML = 'X:' + img_x + ',' + ' Y:' + img_y;
  }

  if ( _via_is_region_selected ) {
    // display the region's info if a region is selected
    if ( rf != null && _via_is_region_info_visible && _via_user_sel_region_id !== -1) {
      var canvas_attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
      switch (canvas_attr['name']) {
      case VIA_REGION_SHAPE.RECT:
        break;

      case VIA_REGION_SHAPE.CIRCLE:
        var rf = document.getElementById('region_info');
        var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
        rf.innerHTML +=  ',' + ' Radius:' + attr['r'];
        break;

      case VIA_REGION_SHAPE.ELLIPSE:
        var rf = document.getElementById('region_info');
        var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;
        rf.innerHTML +=  ',' + ' X-radius:' + attr['rx'] + ',' + ' Y-radius:' + attr['ry'];
        break;

      case VIA_REGION_SHAPE.POLYLINE:
      case VIA_REGION_SHAPE.POLYGON:
        break;
      }
    }

    if ( !_via_is_user_resizing_region ) {
      // check if user moved mouse cursor to region boundary
      // which indicates an intention to resize the region
      _via_region_edge = is_on_region_corner(_via_current_x, _via_current_y);

      if ( _via_region_edge[0] === _via_user_sel_region_id ) {
        switch(_via_region_edge[1]) {
          // rect
        case 1: // Fall-through // top-left corner of rect
        case 3: // bottom-right corner of rect
          _via_reg_canvas.style.cursor = "nwse-resize";
          break;
        case 2: // Fall-through // top-right corner of rect
        case 4: // bottom-left corner of rect
          _via_reg_canvas.style.cursor = "nesw-resize";
          break;

        case 5: // Fall-through // top-middle point of rect
        case 7: // bottom-middle point of rect
          _via_reg_canvas.style.cursor = "ns-resize";
          break;
        case 6: // Fall-through // top-middle point of rect
        case 8: // bottom-middle point of rect
          _via_reg_canvas.style.cursor = "ew-resize";
          break;

          // circle and ellipse
        case 5:
          _via_reg_canvas.style.cursor = "n-resize";
          break;
        case 6:
          _via_reg_canvas.style.cursor = "e-resize";
          break;

        default:
          _via_reg_canvas.style.cursor = "default";
          break;
        }

        if (_via_region_edge[1] >= VIA_POLYGON_RESIZE_VERTEX_OFFSET) {
          // indicates mouse over polygon vertex
          _via_reg_canvas.style.cursor = "crosshair";
          show_message('To move vertex, simply drag the vertex. To add vertex, press [Ctrl] key and click on the edge. To delete vertex, press [Ctrl] key and click on vertex.');
        }
      } else {
        var yes = is_inside_this_region(_via_current_x,
                                        _via_current_y,
                                        _via_user_sel_region_id);
        if (yes) {
          _via_reg_canvas.style.cursor = "move";
        } else {
          _via_reg_canvas.style.cursor = "default";
        }

      }
    } else {
      annotation_editor_hide() // resizing
    }
  }

  if(_via_is_user_drawing_region) {
    // draw region as the user drags the mouse cursor
    if (_via_canvas_regions.length) {
      _via_redraw_reg_canvas(); // clear old intermediate rectangle
    } else {
      // first region being drawn, just clear the full region canvas
      _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
    }

    var region_x0 = _via_click_x0;
    var region_y0 = _via_click_y0;

    var dx = Math.round(Math.abs(_via_current_x - _via_click_x0));
    var dy = Math.round(Math.abs(_via_current_y - _via_click_y0));
    _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_FILL_COLOR;

    switch (_via_current_shape ) {
    case VIA_REGION_SHAPE.RECT:
      if ( _via_click_x0 < _via_current_x ) {
        if ( _via_click_y0 < _via_current_y ) {
          region_x0 = _via_click_x0;
          region_y0 = _via_click_y0;
        } else {
          region_x0 = _via_click_x0;
          region_y0 = _via_current_y;
        }
      } else {
        if ( _via_click_y0 < _via_current_y ) {
          region_x0 = _via_current_x;
          region_y0 = _via_click_y0;
        } else {
          region_x0 = _via_current_x;
          region_y0 = _via_current_y;
        }
      }

      _via_draw_rect_region(region_x0, region_y0, dx, dy, false);

      // display the current region info
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' W:' + dx + ',' + ' H:' + dy;
      }
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      var circle_radius = Math.round(Math.sqrt( dx*dx + dy*dy ));
      _via_draw_circle_region(region_x0, region_y0, circle_radius, false);

      // display the current region info
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' Radius:' + circle_radius;
      }
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      _via_draw_ellipse_region(region_x0, region_y0, dx, dy, 0, false);

      // display the current region info
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' X-radius:' + fixfloat(dx) + ',' + ' Y-radius:' + fixfloat(dy);
      }
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      // this is handled by the if ( _via_is_user_drawing_polygon ) { ... }
      // see below
      break;
    }
    _via_reg_canvas.focus();
  }

  if ( _via_is_user_resizing_region ) {
    // user has clicked mouse on bounding box edge and is now moving it
    // draw region as the user drags the mouse coursor
    if (_via_canvas_regions.length) {
      _via_redraw_reg_canvas(); // clear old intermediate rectangle
    } else {
      // first region being drawn, just clear the full region canvas
      _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
    }

    var region_id = _via_region_edge[0];
    var attr = _via_canvas_regions[region_id].shape_attributes;
    switch (attr['name']) {
    case VIA_REGION_SHAPE.RECT:
      // original rectangle
      var d = [attr['x'], attr['y'], 0, 0];
      d[2] = d[0] + attr['width'];
      d[3] = d[1] + attr['height'];

      var mx = _via_current_x;
      var my = _via_current_y;
      var preserve_aspect_ratio = false;
      // constrain (mx,my) to lie on a line connecting a diagonal of rectangle
      if ( _via_is_ctrl_pressed ) {
        preserve_aspect_ratio = true;
      }

      rect_update_corner(_via_region_edge[1], d, mx, my, preserve_aspect_ratio);
      rect_standardize_coordinates(d);

      var w = Math.abs(d[2] - d[0]);
      var h = Math.abs(d[3] - d[1]);
      _via_draw_rect_region(d[0], d[1], w, h, true);

      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' W:' + w + ',' + ' H:' + h;
      }
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      var dx = Math.abs(attr['cx'] - _via_current_x);
      var dy = Math.abs(attr['cy'] - _via_current_y);
      var new_r = Math.sqrt( dx*dx + dy*dy );
      _via_draw_circle_region(attr['cx'],
                              attr['cy'],
                              new_r,
                              true);
      if ( rf != null && _via_is_region_info_visible ) {
        var curr_texts = rf.innerHTML.split(",");
        rf.innerHTML = "";
        rf.innerHTML +=  curr_texts[0] + ',' + curr_texts[1] + ',' + ' Radius:' + Math.round(new_r);
      }
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      var new_rx = attr['rx'];
      var new_ry = attr['ry'];
      var new_theta = attr['theta'];
      var dx = Math.abs(attr['cx'] - _via_current_x);
      var dy = Math.abs(attr['cy'] - _via_current_y);
      switch(_via_region_edge[1]) {
      case 5:
        new_ry = Math.sqrt(dx*dx + dy*dy);
        new_theta = Math.atan2(- (_via_current_x - attr['cx']), (_via_current_y - attr['cy']));
        break;

      case 6:
        new_rx = Math.sqrt(dx*dx + dy*dy);
        new_theta = Math.atan2((_via_current_y - attr['cy']), (_via_current_x - attr['cx']));
        break;

      default:
        new_rx = dx;
        new_ry = dy;
        new_theta = 0;
        break;
      }

      _via_draw_ellipse_region(attr['cx'],
                               attr['cy'],
                               new_rx,
                               new_ry,
                               new_theta,
                               true);
      if ( rf != null && _via_is_region_info_visible ) {
        var curr_texts = rf.innerHTML.split(",");
        rf.innerHTML = "";
        rf.innerHTML = curr_texts[0] + ',' + curr_texts[1] + ',' + ' X-radius:' + fixfloat(new_rx) + ',' + ' Y-radius:' + fixfloat(new_ry);
      }
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      var moved_all_points_x = attr['all_points_x'].slice(0);
      var moved_all_points_y = attr['all_points_y'].slice(0);
      var moved_vertex_id = _via_region_edge[1] - VIA_POLYGON_RESIZE_VERTEX_OFFSET;

      moved_all_points_x[moved_vertex_id] = _via_current_x;
      moved_all_points_y[moved_vertex_id] = _via_current_y;

      _via_draw_polygon_region(moved_all_points_x,
                               moved_all_points_y,
                               true,
                               attr['name']);
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' Vertices:' + attr['all_points_x'].length;
      }
      break;
    }
    _via_reg_canvas.focus();
  }

  if ( _via_is_user_moving_region ) {
    // draw region as the user drags the mouse coursor
    if (_via_canvas_regions.length) {
      _via_redraw_reg_canvas(); // clear old intermediate rectangle
    } else {
      // first region being drawn, just clear the full region canvas
      _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
    }

    var move_x = (_via_current_x - _via_region_click_x);
    var move_y = (_via_current_y - _via_region_click_y);
    var attr = _via_canvas_regions[_via_user_sel_region_id].shape_attributes;

    switch (attr['name']) {
    case VIA_REGION_SHAPE.RECT:
      _via_draw_rect_region(attr['x'] + move_x,
                            attr['y'] + move_y,
                            attr['width'],
                            attr['height'],
                            true);
      // display the current region info
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' W:' + attr['width'] + ',' + ' H:' + attr['height'];
      }
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      _via_draw_circle_region(attr['cx'] + move_x,
                              attr['cy'] + move_y,
                              attr['r'],
                              true);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      if (typeof(attr['theta']) === 'undefined') { attr['theta'] = 0; }
      _via_draw_ellipse_region(attr['cx'] + move_x,
                               attr['cy'] + move_y,
                               attr['rx'],
                               attr['ry'],
                               attr['theta'],
                               true);
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      var moved_all_points_x = attr['all_points_x'].slice(0);
      var moved_all_points_y = attr['all_points_y'].slice(0);
      for (var i=0; i<moved_all_points_x.length; ++i) {
        moved_all_points_x[i] += move_x;
        moved_all_points_y[i] += move_y;
      }
      _via_draw_polygon_region(moved_all_points_x,
                               moved_all_points_y,
                               true,
                               attr['name']);
      if ( rf != null && _via_is_region_info_visible ) {
        rf.innerHTML +=  ',' + ' Vertices:' + attr['all_points_x'].length;
      }
      break;

    case VIA_REGION_SHAPE.POINT:
      _via_draw_point_region(attr['cx'] + move_x,
                             attr['cy'] + move_y,
                             true);
      break;
    }
    _via_reg_canvas.focus();
    annotation_editor_hide() // moving
    return;
  }

  if ( _via_is_user_drawing_polygon ) {
    _via_redraw_reg_canvas();
    var attr = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes;
    var all_points_x = attr['all_points_x'];
    var all_points_y = attr['all_points_y'];
    var npts = all_points_x.length;

    if ( npts > 0 ) {
      var line_x = [all_points_x[npts-1], _via_current_x];
      var line_y = [all_points_y[npts-1], _via_current_y];
      _via_draw_polygon_region(line_x, line_y, false, attr['name']);

      for ( var i = 0; i < npts; ++i ) {
        _via_draw_polygon_preview_vertex(all_points_x[i], all_points_y[i], VIA_THEME_POLYGON_VERTEX_RADIUS);
      }
      _via_draw_polygon_preview_vertex(_via_current_x, _via_current_y, VIA_THEME_POLYGON_CURSOR_RADIUS);
    }

    if ( rf != null && _via_is_region_info_visible ) {
      rf.innerHTML +=  ',' + ' Vertices:' + npts;
    }
  }
}

function _via_move_selected_regions(move_x, move_y) {
  var i, n;
  n = _via_region_selected_flag.length;
  for ( i = 0; i < n; ++i ) {
    if ( _via_region_selected_flag[i] ) {
      _via_move_region(i, move_x, move_y);
    }
  }
}

function _via_validate_move_region(x, y, canvas_attr) {
  switch( canvas_attr['name'] ) {
    case VIA_REGION_SHAPE.RECT:
      // left and top boundary check
      if (x < 0 || y < 0) {
          show_message('Region moved beyond image boundary. Resetting.');
          return false;
      }
      // right and bottom boundary check
      if ((y + canvas_attr['height']) > _via_current_image_height ||
          (x + canvas_attr['width']) > _via_current_image_width) {
            show_message('Region moved beyond image boundary. Resetting.');
            return false;
      }

    // same validation for all
    case VIA_REGION_SHAPE.CIRCLE:
    case VIA_REGION_SHAPE.ELLIPSE:
    case VIA_REGION_SHAPE.POLYLINE:
    case VIA_REGION_SHAPE.POLYGON:
      if (x < 0 || y < 0 ||
          x > _via_current_image_width || y > _via_current_image_height) {
          show_message('Region moved beyond image boundary. Resetting.');
          return false;
      }
      break;

    case VIA_REGION_SHAPE.POINT:
      return true;
  }
  return true;
}

function _via_move_region(region_id, move_x, move_y) {
  var image_attr = _via_img_metadata[_via_image_id].regions[region_id].shape_attributes;
  var canvas_attr = _via_canvas_regions[region_id].shape_attributes;

  switch( canvas_attr['name'] ) {
  case VIA_REGION_SHAPE.RECT:
    var xnew = image_attr['x'] + Math.round(move_x * _via_canvas_scale);
    var ynew = image_attr['y'] + Math.round(move_y * _via_canvas_scale);

    var is_valid = _via_validate_move_region(xnew, ynew, image_attr);
    if (! is_valid ) { break; }

    image_attr['x'] = xnew;
    image_attr['y'] = ynew;

    canvas_attr['x'] = Math.round( image_attr['x'] / _via_canvas_scale);
    canvas_attr['y'] = Math.round( image_attr['y'] / _via_canvas_scale);
    break;

  case VIA_REGION_SHAPE.CIRCLE: // Fall-through
  case VIA_REGION_SHAPE.ELLIPSE: // Fall-through
  case VIA_REGION_SHAPE.POINT:
    var cxnew = image_attr['cx'] + Math.round(move_x * _via_canvas_scale);
    var cynew = image_attr['cy'] + Math.round(move_y * _via_canvas_scale);

    var is_valid = _via_validate_move_region(cxnew, cynew, image_attr);
    if (! is_valid ) { break; }

    image_attr['cx'] = cxnew;
    image_attr['cy'] = cynew;

    canvas_attr['cx'] = Math.round( image_attr['cx'] / _via_canvas_scale);
    canvas_attr['cy'] = Math.round( image_attr['cy'] / _via_canvas_scale);
    break;

  case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
  case VIA_REGION_SHAPE.POLYGON:
    var img_px = image_attr['all_points_x'];
    var img_py = image_attr['all_points_y'];
    var canvas_px = canvas_attr['all_points_x'];
    var canvas_py = canvas_attr['all_points_y'];
    // clone for reverting if valiation fails
    var img_px_old = Object.assign({}, img_px);
    var img_py_old = Object.assign({}, img_py);

    // validate move
    for (var i=0; i<img_px.length; ++i) {
      var pxnew = img_px[i] + Math.round(move_x * _via_canvas_scale);
      var pynew = img_py[i] + Math.round(move_y * _via_canvas_scale);
      if (! _via_validate_move_region(pxnew, pynew, image_attr) ) {
        img_px = img_px_old;
        img_py = img_py_old;
        break;
      }
    }
    // move points
    for (var i=0; i<img_px.length; ++i) {
      img_px[i] = img_px[i] + Math.round(move_x * _via_canvas_scale);
      img_py[i] = img_py[i] + Math.round(move_y * _via_canvas_scale);
    }

    for (var i=0; i<canvas_px.length; ++i) {
      canvas_px[i] = Math.round( img_px[i] / _via_canvas_scale );
      canvas_py[i] = Math.round( img_py[i] / _via_canvas_scale );
    }
    break;
  }
}

function _via_polygon_del_vertex(region_id, vertex_id) {
  var rs    = _via_canvas_regions[region_id].shape_attributes;
  var npts  = rs['all_points_x'].length;
  var shape = rs['name'];
  if ( shape !== VIA_REGION_SHAPE.POLYGON && shape !== VIA_REGION_SHAPE.POLYLINE ) {
    show_message('Vertices can only be deleted from polygon/polyline.');
    return false;
  }
  if ( npts <=3 && shape === VIA_REGION_SHAPE.POLYGON ) {
    show_message('Failed to delete vertex because a polygon must have at least 3 vertices.');
    return false;
  }
  if ( npts <=2 && shape === VIA_REGION_SHAPE.POLYLINE ) {
    show_message('Failed to delete vertex because a polyline must have at least 2 vertices.');
    return false;
  }
  // delete vertex from canvas
  _via_canvas_regions[region_id].shape_attributes['all_points_x'].splice(vertex_id, 1);
  _via_canvas_regions[region_id].shape_attributes['all_points_y'].splice(vertex_id, 1);

  // delete vertex from image metadata
  _via_img_metadata[_via_image_id].regions[region_id].shape_attributes['all_points_x'].splice(vertex_id, 1);
  _via_img_metadata[_via_image_id].regions[region_id].shape_attributes['all_points_y'].splice(vertex_id, 1);
  return true;
}

//
// Canvas update routines
//
function _via_redraw_reg_canvas() {
  if (_via_current_image_loaded) {
    _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
    if ( _via_canvas_regions.length > 0 ) {
      if (_via_is_region_boundary_visible) {
        draw_all_regions();
      }
      if (_via_is_region_id_visible) {
        draw_all_region_id();
      }
    }
  }
}

