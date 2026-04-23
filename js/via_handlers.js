function _via_clear_reg_canvas() {
  _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
}

function draw_all_regions() {
  var aid = _via_settings.ui.image.region_color;
  var attr, is_selected, aid, avalue;
  for (var i=0; i < _via_canvas_regions.length; ++i) {
    attr = _via_canvas_regions[i].shape_attributes;
    is_selected = _via_region_selected_flag[i];

    // region stroke style may depend on attribute value
    _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_FILL_COLOR;
    if ( ! _via_is_user_drawing_polygon &&
         aid !== '__via_default_region_color__' ) {
      avalue = _via_img_metadata[_via_image_id].regions[i].region_attributes[aid];
      if ( _via_canvas_regions_group_color.hasOwnProperty(avalue) ) {
        _via_reg_ctx.strokeStyle = _via_canvas_regions_group_color[avalue];
      }
    }

    switch( attr['name'] ) {
    case VIA_REGION_SHAPE.RECT:
      _via_draw_rect_region(attr['x'],
                            attr['y'],
                            attr['width'],
                            attr['height'],
                            is_selected);
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      _via_draw_circle_region(attr['cx'],
                              attr['cy'],
                              attr['r'],
                              is_selected);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      if (typeof(attr['theta']) === 'undefined') { attr['theta'] = 0; }
      _via_draw_ellipse_region(attr['cx'],
                               attr['cy'],
                               attr['rx'],
                               attr['ry'],
                               attr['theta'],
                               is_selected);
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      _via_draw_polygon_region(attr['all_points_x'],
                               attr['all_points_y'],
                               is_selected,
                               attr['name']);
      break;

    case VIA_REGION_SHAPE.POINT:
      _via_draw_point_region(attr['cx'],
                             attr['cy'],
                             is_selected);
      break;
    }
  }
}

// control point for resize of region boundaries
function _via_draw_control_point(cx, cy) {
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(_via_canvas_offset_x(cx),
                   _via_canvas_offset_y(cy),
                   VIA_REGION_SHAPES_POINTS_RADIUS,
                   0,
                   2*Math.PI,
                   false);
  _via_reg_ctx.closePath();

  _via_reg_ctx.fillStyle = VIA_THEME_CONTROL_POINT_COLOR;
  _via_reg_ctx.globalAlpha = 1.0;
  _via_reg_ctx.fill();
}

function _via_draw_rect_region(x, y, w, h, is_selected) {
  if (is_selected) {
    _via_draw_rect(x, y, w, h);

    _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_reg_ctx.stroke();

    _via_reg_ctx.fillStyle   = VIA_THEME_SEL_REGION_FILL_COLOR;
    _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
    _via_reg_ctx.fill();
    _via_reg_ctx.globalAlpha = 1.0;

    _via_draw_control_point(x  ,   y);
    _via_draw_control_point(x+w, y+h);
    _via_draw_control_point(x  , y+h);
    _via_draw_control_point(x+w,   y);
    _via_draw_control_point(x+w/2,   y);
    _via_draw_control_point(x+w/2, y+h);
    _via_draw_control_point(x    , y+h/2);
    _via_draw_control_point(x+w  , y+h/2);
  } else {
    // draw a fill line
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_draw_rect(x, y, w, h);
    _via_reg_ctx.stroke();

    if ( w > VIA_THEME_REGION_BOUNDARY_WIDTH &&
         h > VIA_THEME_REGION_BOUNDARY_WIDTH ) {
      // draw a boundary line on both sides of the fill line
      _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_LINE_COLOR;
      _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/4;
      _via_draw_rect(x - VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                     y - VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                     w + VIA_THEME_REGION_BOUNDARY_WIDTH,
                     h + VIA_THEME_REGION_BOUNDARY_WIDTH);
      _via_reg_ctx.stroke();

      _via_draw_rect(x + VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                     y + VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                     w - VIA_THEME_REGION_BOUNDARY_WIDTH,
                     h - VIA_THEME_REGION_BOUNDARY_WIDTH);
      _via_reg_ctx.stroke();
    }
  }
}

function _via_draw_rect(x, y, w, h) {
  var ox = _via_canvas_offset_x(x);
  var oy = _via_canvas_offset_y(y);
  _via_reg_ctx.beginPath();
  _via_reg_ctx.moveTo(ox  , oy);
  _via_reg_ctx.lineTo(ox+w, oy);
  _via_reg_ctx.lineTo(ox+w, oy+h);
  _via_reg_ctx.lineTo(ox  , oy+h);
  _via_reg_ctx.closePath();
}

function _via_draw_circle_region(cx, cy, r, is_selected) {
  if (is_selected) {
    _via_draw_circle(cx, cy, r);

    _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_reg_ctx.stroke();

    _via_reg_ctx.fillStyle   = VIA_THEME_SEL_REGION_FILL_COLOR;
    _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
    _via_reg_ctx.fill();
    _via_reg_ctx.globalAlpha = 1.0;

    _via_draw_control_point(cx + r, cy);
  } else {
    // draw a fill line
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_draw_circle(cx, cy, r);
    _via_reg_ctx.stroke();

    if ( r > VIA_THEME_REGION_BOUNDARY_WIDTH ) {
      // draw a boundary line on both sides of the fill line
      _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_LINE_COLOR;
      _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/4;
      _via_draw_circle(cx, cy,
                       r - VIA_THEME_REGION_BOUNDARY_WIDTH/2);
      _via_reg_ctx.stroke();
      _via_draw_circle(cx, cy,
                       r + VIA_THEME_REGION_BOUNDARY_WIDTH/2);
      _via_reg_ctx.stroke();
    }
  }
}

function _via_draw_circle(cx, cy, r) {
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(_via_canvas_offset_x(cx), _via_canvas_offset_y(cy), r, 0, 2*Math.PI, false);
  _via_reg_ctx.closePath();
}

function _via_draw_ellipse_region(cx, cy, rx, ry, rr, is_selected) {
  if (is_selected) {
    _via_draw_ellipse(cx, cy, rx, ry, rr);

    _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_reg_ctx.stroke();

    _via_reg_ctx.fillStyle   = VIA_THEME_SEL_REGION_FILL_COLOR;
    _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
    _via_reg_ctx.fill();
    _via_reg_ctx.globalAlpha = 1.0;

    _via_draw_control_point(cx + rx * Math.cos(rr), cy + rx * Math.sin(rr));
    _via_draw_control_point(cx - rx * Math.cos(rr), cy - rx * Math.sin(rr));
    _via_draw_control_point(cx + ry * Math.sin(rr), cy - ry * Math.cos(rr));
    _via_draw_control_point(cx - ry * Math.sin(rr), cy + ry * Math.cos(rr));

  } else {
    // draw a fill line
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_draw_ellipse(cx, cy, rx, ry, rr);
    _via_reg_ctx.stroke();

    if ( rx > VIA_THEME_REGION_BOUNDARY_WIDTH &&
         ry > VIA_THEME_REGION_BOUNDARY_WIDTH ) {
      // draw a boundary line on both sides of the fill line
      _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_LINE_COLOR;
      _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/4;
      _via_draw_ellipse(cx, cy,
                        rx + VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                        ry + VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                        rr);
      _via_reg_ctx.stroke();
      _via_draw_ellipse(cx, cy,
                        rx - VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                        ry - VIA_THEME_REGION_BOUNDARY_WIDTH/2,
                        rr);
      _via_reg_ctx.stroke();
    }
  }
}

function _via_draw_ellipse(cx, cy, rx, ry, rr) {
  _via_reg_ctx.save();

  _via_reg_ctx.beginPath();
  _via_reg_ctx.ellipse(_via_canvas_offset_x(cx),
                       _via_canvas_offset_y(cy),
                       rx,
                       ry,
             rr,
             0,
                       2 * Math.PI);

  _via_reg_ctx.restore(); // restore to original state
  _via_reg_ctx.closePath();
}

function _via_draw_polygon_region(all_points_x, all_points_y, is_selected, shape) {
  _via_reg_ctx.strokeStyle = VIA_THEME_POLYGON_BOUNDARY_COLOR;
  _via_reg_ctx.lineWidth = VIA_THEME_POLYGON_LINE_WIDTH;

  if ( is_selected ) {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.moveTo(_via_canvas_offset_x(all_points_x[0]), _via_canvas_offset_y(all_points_y[0]));
    for ( var i=1; i < all_points_x.length; ++i ) {
      _via_reg_ctx.lineTo(_via_canvas_offset_x(all_points_x[i]), _via_canvas_offset_y(all_points_y[i]));
    }
    if ( shape === VIA_REGION_SHAPE.POLYGON ) {
      _via_reg_ctx.lineTo(_via_canvas_offset_x(all_points_x[0]), _via_canvas_offset_y(all_points_y[0])); // close loop
    }
    _via_reg_ctx.stroke();

    if ( shape === VIA_REGION_SHAPE.POLYGON && all_points_x.length >= 3 ) {
      _via_reg_ctx.fillStyle = VIA_THEME_POLYGON_FILL_COLOR;
      _via_reg_ctx.globalAlpha = VIA_THEME_POLYGON_FILL_OPACITY + 0.08;
      _via_reg_ctx.fill();
    }
    _via_reg_ctx.globalAlpha = 1.0;
    for ( var i=0; i < all_points_x.length; ++i ) {
      _via_draw_control_point(all_points_x[i], all_points_y[i]);
    }
  } else {
    _via_reg_ctx.beginPath();
    _via_reg_ctx.moveTo(_via_canvas_offset_x(all_points_x[0]), _via_canvas_offset_y(all_points_y[0]));
    for ( var i=0; i < all_points_x.length; ++i ) {
      _via_reg_ctx.lineTo(_via_canvas_offset_x(all_points_x[i]), _via_canvas_offset_y(all_points_y[i]));
    }
    if ( shape === VIA_REGION_SHAPE.POLYGON ) {
      _via_reg_ctx.lineTo(_via_canvas_offset_x(all_points_x[0]), _via_canvas_offset_y(all_points_y[0])); // close loop
    }

    if ( shape === VIA_REGION_SHAPE.POLYGON && all_points_x.length >= 3 ) {
      _via_reg_ctx.fillStyle = VIA_THEME_POLYGON_FILL_COLOR;
      _via_reg_ctx.globalAlpha = VIA_THEME_POLYGON_FILL_OPACITY;
      _via_reg_ctx.fill();
      _via_reg_ctx.globalAlpha = 1.0;
    }

    _via_reg_ctx.stroke();
  }
}

function _via_draw_polygon_preview_vertex(cx, cy, radius) {
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(_via_canvas_offset_x(cx),
                   _via_canvas_offset_y(cy),
                   radius,
                   0,
                   2 * Math.PI,
                   false);
  _via_reg_ctx.closePath();
  _via_reg_ctx.fillStyle = VIA_THEME_POLYGON_BOUNDARY_COLOR;
  _via_reg_ctx.globalAlpha = 1.0;
  _via_reg_ctx.fill();
  _via_reg_ctx.strokeStyle = '#ffffff';
  _via_reg_ctx.lineWidth = 2;
  _via_reg_ctx.stroke();
}

function _via_draw_point_region(cx, cy, is_selected) {
  if (is_selected) {
    _via_draw_point(cx, cy, VIA_REGION_POINT_RADIUS);

    _via_reg_ctx.strokeStyle = VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR;
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_reg_ctx.stroke();

    _via_reg_ctx.fillStyle   = VIA_THEME_SEL_REGION_FILL_COLOR;
    _via_reg_ctx.globalAlpha = VIA_THEME_SEL_REGION_OPACITY;
    _via_reg_ctx.fill();
    _via_reg_ctx.globalAlpha = 1.0;
  } else {
    // draw a fill line
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/2;
    _via_draw_point(cx, cy, VIA_REGION_POINT_RADIUS);
    _via_reg_ctx.stroke();

    // draw a boundary line on both sides of the fill line
    _via_reg_ctx.strokeStyle = VIA_THEME_BOUNDARY_LINE_COLOR;
    _via_reg_ctx.lineWidth   = VIA_THEME_REGION_BOUNDARY_WIDTH/4;
    _via_draw_point(cx, cy,
                    VIA_REGION_POINT_RADIUS - VIA_THEME_REGION_BOUNDARY_WIDTH/2);
    _via_reg_ctx.stroke();
    _via_draw_point(cx, cy,
                    VIA_REGION_POINT_RADIUS + VIA_THEME_REGION_BOUNDARY_WIDTH/2);
    _via_reg_ctx.stroke();
  }
}

function _via_draw_point(cx, cy, r) {
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(_via_canvas_offset_x(cx), _via_canvas_offset_y(cy), r, 0, 2*Math.PI, false);
  _via_reg_ctx.closePath();
}

function draw_all_region_id() {
  _via_reg_ctx.shadowColor = "transparent";
  _via_reg_ctx.font = _via_settings.ui.image.region_label_font;
  for ( var i = 0; i < _via_img_metadata[_via_image_id].regions.length; ++i ) {
    var canvas_reg = _via_canvas_regions[i];

    var bbox = get_region_bounding_box(canvas_reg);
    var x = bbox[0];
    var y = bbox[1];
    var w = Math.abs(bbox[2] - bbox[0]);

    var char_width  = _via_reg_ctx.measureText('M').width;
    var char_height = 1.8 * char_width;

    var annotation_str  = (i+1).toString();
    var rattr = _via_img_metadata[_via_image_id].regions[i].region_attributes[_via_settings.ui.image.region_label];
    var rshape = _via_img_metadata[_via_image_id].regions[i].shape_attributes['name'];
    if ( _via_settings.ui.image.region_label !== '__via_region_id__' ) {
      if ( typeof(rattr) !== 'undefined' ) {
        switch( typeof(rattr) ) {
        default:
        case 'string':
          annotation_str = rattr;
          break;
        case 'object':
          annotation_str = Object.keys(rattr).join(',');
          break;
        }
      } else {
        annotation_str = 'undefined';
      }
    }

    var bgnd_rect_width;
    var strw = _via_reg_ctx.measureText(annotation_str).width;
    if ( strw > w ) {
      if ( _via_settings.ui.image.region_label === '__via_region_id__' ) {
        // region-id is always visible in full
        bgnd_rect_width = strw + char_width;
      } else {

        // if text overflows, crop it
        var str_max     = Math.floor((w * annotation_str.length) / strw);
        if ( str_max > 1 ) {
          annotation_str  = annotation_str.substr(0, str_max-1) + '.';
          bgnd_rect_width = w;
        } else {
          annotation_str  = annotation_str.substr(0, 1) + '.';
          bgnd_rect_width = 2 * char_width;
        }
      }
    } else {
      bgnd_rect_width = strw + char_width;
    }

    if (canvas_reg.shape_attributes['name'] === VIA_REGION_SHAPE.POLYGON ||
        canvas_reg.shape_attributes['name'] === VIA_REGION_SHAPE.POLYLINE) {
      // put label near the first vertex
      x = canvas_reg.shape_attributes['all_points_x'][0];
      y = canvas_reg.shape_attributes['all_points_y'][0];
    } else {
      // center the label
      x = x - (bgnd_rect_width/2 - w/2);
    }

    // ensure that the text is within the image boundaries
    if ( y < char_height ) {
      y = char_height;
    }

    // first, draw a background rectangle first
    _via_reg_ctx.fillStyle = 'black';
    _via_reg_ctx.globalAlpha = 0.8;
    _via_reg_ctx.fillRect(Math.floor(_via_canvas_offset_x(x)),
                Math.floor(_via_canvas_offset_y(y - 1.1*char_height)),
                          Math.floor(bgnd_rect_width),
                          Math.floor(char_height));

    // then, draw text over this background rectangle
    _via_reg_ctx.globalAlpha = 1.0;
    _via_reg_ctx.fillStyle = 'yellow';
    _via_reg_ctx.fillText(annotation_str,
                          Math.floor(_via_canvas_offset_x(x + 0.4*char_width)),
                          Math.floor(_via_canvas_offset_y(y - 0.35*char_height)));

  }
}

function get_region_bounding_box(region) {
  var d = region.shape_attributes;
  var bbox = new Array(4);

  switch( d['name'] ) {
  case 'rect':
    bbox[0] = d['x'];
    bbox[1] = d['y'];
    bbox[2] = d['x'] + d['width'];
    bbox[3] = d['y'] + d['height'];
    break;

  case 'circle':
    bbox[0] = d['cx'] - d['r'];
    bbox[1] = d['cy'] - d['r'];
    bbox[2] = d['cx'] + d['r'];
    bbox[3] = d['cy'] + d['r'];
    break;

  case 'ellipse':
    let radians = d['theta'];
    let radians90 = radians + Math.PI / 2;
    let ux = d['rx'] * Math.cos(radians);
    let uy = d['rx'] * Math.sin(radians);
    let vx = d['ry'] * Math.cos(radians90);
    let vy = d['ry'] * Math.sin(radians90);

    let width = Math.sqrt(ux * ux + vx * vx) * 2;
    let height = Math.sqrt(uy * uy + vy * vy) * 2;

    bbox[0] = d['cx'] - (width / 2);
    bbox[1] = d['cy'] - (height / 2);
    bbox[2] = d['cx'] + (width / 2);
    bbox[3] = d['cy'] + (height / 2);
    break;

  case 'polyline': // handled by polygon
  case 'polygon':
    var all_points_x = d['all_points_x'];
    var all_points_y = d['all_points_y'];

    var minx = Number.MAX_SAFE_INTEGER;
    var miny = Number.MAX_SAFE_INTEGER;
    var maxx = 0;
    var maxy = 0;
    for ( var i=0; i < all_points_x.length; ++i ) {
      if ( all_points_x[i] < minx ) {
        minx = all_points_x[i];
      }
      if ( all_points_x[i] > maxx ) {
        maxx = all_points_x[i];
      }
      if ( all_points_y[i] < miny ) {
        miny = all_points_y[i];
      }
      if ( all_points_y[i] > maxy ) {
        maxy = all_points_y[i];
      }
    }
    bbox[0] = minx;
    bbox[1] = miny;
    bbox[2] = maxx;
    bbox[3] = maxy;
    break;

  case 'point':
    bbox[0] = d['cx'] - VIA_REGION_POINT_RADIUS;
    bbox[1] = d['cy'] - VIA_REGION_POINT_RADIUS;
    bbox[2] = d['cx'] + VIA_REGION_POINT_RADIUS;
    bbox[3] = d['cy'] + VIA_REGION_POINT_RADIUS;
    break;
  }
  return bbox;
}

//
// Region collision routines
//
function is_inside_region(px, py, descending_order) {
  var N = _via_canvas_regions.length;
  if ( N === 0 ) {
    return -1;
  }
  var start, end, del;
  // traverse the canvas regions in alternating ascending
  // and descending order to solve the issue of nested regions
  if ( descending_order ) {
    start = N - 1;
    end   = -1;
    del   = -1;
  } else {
    start = 0;
    end   = N;
    del   = 1;
  }

  var i = start;
  while ( i !== end ) {
    var yes = is_inside_this_region(px, py, i);
    if (yes) {
      return i;
    }
    i = i + del;
  }
  return -1;
}

function is_inside_this_region(px, py, region_id) {
  var attr   = _via_canvas_regions[region_id].shape_attributes;
  var result = false;
  switch ( attr['name'] ) {
  case VIA_REGION_SHAPE.RECT:
    result = is_inside_rect(attr['x'],
                            attr['y'],
                            attr['width'],
                            attr['height'],
                            px, py);
    break;

  case VIA_REGION_SHAPE.CIRCLE:
    result = is_inside_circle(attr['cx'],
                              attr['cy'],
                              attr['r'],
                              px, py);
    break;

  case VIA_REGION_SHAPE.ELLIPSE:
    result = is_inside_ellipse(attr['cx'],
                               attr['cy'],
                               attr['rx'],
                               attr['ry'],
                               attr['theta'],
                               px, py);
    break;

  case VIA_REGION_SHAPE.POLYLINE: // handled by POLYGON
  case VIA_REGION_SHAPE.POLYGON:
    result = is_inside_polygon(attr['all_points_x'],
                               attr['all_points_y'],
                               px, py);
    break;

  case VIA_REGION_SHAPE.POINT:
    result = is_inside_point(attr['cx'],
                             attr['cy'],
                             px, py);
    break;
  }
  return result;
}

function is_inside_circle(cx, cy, r, px, py) {
  var dx = px - cx;
  var dy = py - cy;
  return (dx * dx + dy * dy) < r * r;
}

function is_inside_rect(x, y, w, h, px, py) {
  return px > x &&
    px < (x + w) &&
    py > y &&
    py < (y + h);
}

function is_inside_ellipse(cx, cy, rx, ry, rr, px, py) {
  // Inverse rotation of pixel coordinates
  var dx = Math.cos(-rr) * (cx - px) - Math.sin(-rr) * (cy - py)
  var dy = Math.sin(-rr) * (cx - px) + Math.cos(-rr) * (cy - py)

  return ((dx * dx) / (rx * rx)) + ((dy * dy) / (ry * ry)) < 1;
}

// returns 0 when (px,py) is outside the polygon
// source: http://geomalgorithms.com/a03-_inclusion.html
function is_inside_polygon(all_points_x, all_points_y, px, py) {
  if ( all_points_x.length === 0 || all_points_y.length === 0 ) {
    return 0;
  }

  var wn = 0;    // the  winding number counter
  var n = all_points_x.length;
  var i;
  // loop through all edges of the polygon
  for ( i = 0; i < n-1; ++i ) {   // edge from V[i] to  V[i+1]
    var is_left_value = is_left( all_points_x[i], all_points_y[i],
                                 all_points_x[i+1], all_points_y[i+1],
                                 px, py);

    if (all_points_y[i] <= py) {
      if (all_points_y[i+1]  > py && is_left_value > 0) {
        ++wn;
      }
    }
    else {
      if (all_points_y[i+1]  <= py && is_left_value < 0) {
        --wn;
      }
    }
  }

  // also take into account the loop closing edge that connects last point with first point
  var is_left_value = is_left( all_points_x[n-1], all_points_y[n-1],
                               all_points_x[0], all_points_y[0],
                               px, py);

  if (all_points_y[n-1] <= py) {
    if (all_points_y[0]  > py && is_left_value > 0) {
      ++wn;
    }
  }
  else {
    if (all_points_y[0]  <= py && is_left_value < 0) {
      --wn;
    }
  }

  if ( wn === 0 ) {
    return 0;
  }
  else {
    return 1;
  }
}

function is_inside_point(cx, cy, px, py) {
  var dx = px - cx;
  var dy = py - cy;
  var r2 = VIA_POLYGON_VERTEX_MATCH_TOL * VIA_POLYGON_VERTEX_MATCH_TOL;
  return (dx * dx + dy * dy) < r2;
}

// returns
// >0 if (x2,y2) lies on the left side of line joining (x0,y0) and (x1,y1)
// =0 if (x2,y2) lies on the line joining (x0,y0) and (x1,y1)
// >0 if (x2,y2) lies on the right side of line joining (x0,y0) and (x1,y1)
// source: http://geomalgorithms.com/a03-_inclusion.html
function is_left(x0, y0, x1, y1, x2, y2) {
  return ( ((x1 - x0) * (y2 - y0))  - ((x2 -  x0) * (y1 - y0)) );
}

function is_on_region_corner(px, py) {
  var _via_region_edge = [-1, -1]; // region_id, corner_id [top-left=1,top-right=2,bottom-right=3,bottom-left=4]

  for ( var i = 0; i < _via_canvas_regions.length; ++i ) {
    var attr = _via_canvas_regions[i].shape_attributes;
    var result = false;
    _via_region_edge[0] = i;

    switch ( attr['name'] ) {
    case VIA_REGION_SHAPE.RECT:
      result = is_on_rect_edge(attr['x'],
                               attr['y'],
                               attr['width'],
                               attr['height'],
                               px, py);
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      result = is_on_circle_edge(attr['cx'],
                                 attr['cy'],
                                 attr['r'],
                                 px, py);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      result = is_on_ellipse_edge(attr['cx'],
                                  attr['cy'],
                                  attr['rx'],
                                  attr['ry'],
                                  attr['theta'],
                                  px, py);
      break;

    case VIA_REGION_SHAPE.POLYLINE: // handled by polygon
    case VIA_REGION_SHAPE.POLYGON:
      result = is_on_polygon_vertex(attr['all_points_x'],
                                    attr['all_points_y'],
                                    px, py);
      if ( result === 0 ) {
        result = is_on_polygon_edge(attr['all_points_x'],
                                    attr['all_points_y'],
                                    px, py);
      }
      break;

    case VIA_REGION_SHAPE.POINT:
      // since there are no edges of a point
      result = 0;
      break;
    }

    if (result > 0) {
      _via_region_edge[1] = result;
      return _via_region_edge;
    }
  }
  _via_region_edge[0] = -1;
  return _via_region_edge;
}

function is_on_rect_edge(x, y, w, h, px, py) {
  var dx0 = Math.abs(x - px);
  var dy0 = Math.abs(y - py);
  var dx1 = Math.abs(x + w - px);
  var dy1 = Math.abs(y + h - py);
  //[top-left=1,top-right=2,bottom-right=3,bottom-left=4]
  if ( dx0 < VIA_REGION_EDGE_TOL &&
       dy0 < VIA_REGION_EDGE_TOL ) {
    return 1;
  }
  if ( dx1 < VIA_REGION_EDGE_TOL &&
       dy0 < VIA_REGION_EDGE_TOL ) {
    return 2;
  }
  if ( dx1 < VIA_REGION_EDGE_TOL &&
       dy1 < VIA_REGION_EDGE_TOL ) {
    return 3;
  }

  if ( dx0 < VIA_REGION_EDGE_TOL &&
       dy1 < VIA_REGION_EDGE_TOL ) {
    return 4;
  }

  var mx0 = Math.abs(x + w/2 - px);
  var my0 = Math.abs(y + h/2 - py);
  //[top-middle=5,right-middle=6,bottom-middle=7,left-middle=8]
  if ( mx0 < VIA_REGION_EDGE_TOL &&
       dy0 < VIA_REGION_EDGE_TOL ) {
    return 5;
  }
  if ( dx1 < VIA_REGION_EDGE_TOL &&
       my0 < VIA_REGION_EDGE_TOL ) {
    return 6;
  }
  if ( mx0 < VIA_REGION_EDGE_TOL &&
       dy1 < VIA_REGION_EDGE_TOL ) {
    return 7;
  }
  if ( dx0 < VIA_REGION_EDGE_TOL &&
       my0 < VIA_REGION_EDGE_TOL ) {
    return 8;
  }

  return 0;
}

function is_on_circle_edge(cx, cy, r, px, py) {
  var dx = cx - px;
  var dy = cy - py;
  if ( Math.abs(Math.sqrt( dx*dx + dy*dy ) - r) < VIA_REGION_EDGE_TOL ) {
    var theta = Math.atan2( py - cy, px - cx );
    if ( Math.abs(theta - (Math.PI/2)) < VIA_THETA_TOL ||
         Math.abs(theta + (Math.PI/2)) < VIA_THETA_TOL) {
      return 5;
    }
    if ( Math.abs(theta) < VIA_THETA_TOL ||
         Math.abs(Math.abs(theta) - Math.PI) < VIA_THETA_TOL) {
      return 6;
    }

    if ( theta > 0 && theta < (Math.PI/2) ) {
      return 1;
    }
    if ( theta > (Math.PI/2) && theta < (Math.PI) ) {
      return 4;
    }
    if ( theta < 0 && theta > -(Math.PI/2) ) {
      return 2;
    }
    if ( theta < -(Math.PI/2) && theta > -Math.PI ) {
      return 3;
    }
  } else {
    return 0;
  }
}

function is_on_ellipse_edge(cx, cy, rx, ry, rr, px, py) {
  // Inverse rotation of pixel coordinates
  px = px - cx;
  py = py - cy;
  var px_ = Math.cos(-rr) * px - Math.sin(-rr) * py;
  var py_ = Math.sin(-rr) * px + Math.cos(-rr) * py;
  px = px_ + cx;
  py = py_ + cy;

  var dx = (cx - px)/rx;
  var dy = (cy - py)/ry;

  if ( Math.abs(Math.sqrt( dx*dx + dy*dy ) - 1) < VIA_ELLIPSE_EDGE_TOL ) {
    var theta = Math.atan2( py - cy, px - cx );
    if ( Math.abs(theta - (Math.PI/2)) < VIA_THETA_TOL ||
         Math.abs(theta + (Math.PI/2)) < VIA_THETA_TOL) {
      return 5;
    }
    if ( Math.abs(theta) < VIA_THETA_TOL ||
         Math.abs(Math.abs(theta) - Math.PI) < VIA_THETA_TOL) {
      return 6;
    }
  } else {
    return 0;
  }
}

function is_on_polygon_vertex(all_points_x, all_points_y, px, py) {
  var i, n;
  n = all_points_x.length;

  for ( i = 0; i < n; ++i ) {
    if ( Math.abs(all_points_x[i] - px) < VIA_POLYGON_VERTEX_MATCH_TOL &&
         Math.abs(all_points_y[i] - py) < VIA_POLYGON_VERTEX_MATCH_TOL ) {
      return (VIA_POLYGON_RESIZE_VERTEX_OFFSET+i);
    }
  }
  return 0;
}

function is_on_polygon_edge(all_points_x, all_points_y, px, py) {
  var i, n, di, d;
  n = all_points_x.length;
  d = [];
  for ( i = 0; i < n - 1; ++i )  {
    di = dist_to_line(px, py, all_points_x[i], all_points_y[i], all_points_x[i+1], all_points_y[i+1]);
    d.push(di);
  }
  // closing edge
  di = dist_to_line(px, py, all_points_x[n-1], all_points_y[n-1], all_points_x[0], all_points_y[0]);
  d.push(di);

  var smallest_value = d[0];
  var smallest_index = 0;
  n = d.length;
  for ( i = 1; i < n; ++i ) {
    if ( d[i] < smallest_value ) {
      smallest_value = d[i];
      smallest_index = i;
    }
  }
  if ( smallest_value < VIA_POLYGON_VERTEX_MATCH_TOL ) {
    return (VIA_POLYGON_RESIZE_VERTEX_OFFSET + smallest_index);
  } else {
    return 0;
  }
}

function is_point_inside_bounding_box(x, y, x1, y1, x2, y2) {
  // ensure that (x1,y1) is top left and (x2,y2) is bottom right corner of rectangle
  var rect = {};
  if( x1 < x2 ) {
    rect.x1 = x1;
    rect.x2 = x2;
  } else {
    rect.x1 = x2;
    rect.x2 = x1;
  }
  if ( y1 < y2 ) {
    rect.y1 = y1;
    rect.y2 = y2;
  } else {
    rect.y1 = y2;
    rect.y2 = y1;
  }

  if ( x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2 ) {
    return true;
  } else {
    return false;
  }
}

function dist_to_line(x, y, x1, y1, x2, y2) {
  if ( is_point_inside_bounding_box(x, y, x1, y1, x2, y2) ) {
    var dy = y2 - y1;
    var dx = x2 - x1;
    var nr = Math.abs( dy*x - dx*y + x2*y1 - y2*x1 );
    var dr = Math.sqrt( dx*dx + dy*dy );
    var dist = nr / dr;
    return Math.round(dist);
  } else {
    return Number.MAX_SAFE_INTEGER;
  }
}

function rect_standardize_coordinates(d) {
  // d[x0,y0,x1,y1]
  // ensures that (d[0],d[1]) is top-left corner while
  // (d[2],d[3]) is bottom-right corner
  if ( d[0] > d[2] ) {
    // swap
    var t = d[0];
    d[0] = d[2];
    d[2] = t;
  }

  if ( d[1] > d[3] ) {
    // swap
    var t = d[1];
    d[1] = d[3];
    d[3] = t;
  }
}

function rect_update_corner(corner_id, d, x, y, preserve_aspect_ratio) {
  // pre-condition : d[x0,y0,x1,y1] is standardized
  // post-condition : corner is moved ( d may not stay standardized )
  if (preserve_aspect_ratio) {
    switch(corner_id) {
    case 1: // Fall-through // top-left
    case 3: // bottom-right
      var dx = d[2] - d[0];
      var dy = d[3] - d[1];
      var norm = Math.sqrt( dx*dx + dy*dy );
      var nx = dx / norm; // x component of unit vector along the diagonal of rect
      var ny = dy / norm; // y component
      var proj = (x - d[0]) * nx + (y - d[1]) * ny;
      var proj_x = nx * proj;
      var proj_y = ny * proj;
      // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
      x = Math.round( d[0] + proj_x );
      y = Math.round( d[1] + proj_y );
      break;

    case 2: // Fall-through // top-right
    case 4: // bottom-left
      var dx = d[2] - d[0];
      var dy = d[1] - d[3];
      var norm = Math.sqrt( dx*dx + dy*dy );
      var nx = dx / norm; // x component of unit vector along the diagonal of rect
      var ny = dy / norm; // y component
      var proj = (x - d[0]) * nx + (y - d[3]) * ny;
      var proj_x = nx * proj;
      var proj_y = ny * proj;
      // constrain (mx,my) to lie on a line connecting (x0,y0) and (x1,y1)
      x = Math.round( d[0] + proj_x );
      y = Math.round( d[3] + proj_y );
      break;
    }
  }

  switch(corner_id) {
  case 1: // top-left
    d[0] = x;
    d[1] = y;
    break;

  case 3: // bottom-right
    d[2] = x;
    d[3] = y;
    break;

  case 2: // top-right
    d[2] = x;
    d[1] = y;
    break;

  case 4: // bottom-left
    d[0] = x;
    d[3] = y;
    break;

  case 5: // top-middle
    d[1] = y;
    break;

  case 6: // right-middle
    d[2] = x;
    break;

  case 7: // bottom-middle
    d[3] = y;
    break;

  case 8: // left-middle
    d[0] = x;
    break;
  }
}

function _via_update_ui_components() {
  if ( ! _via_current_image_loaded ) {
    return;
  }

  show_message('Updating user interface components.');
  switch(_via_display_area_content_name) {
  case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID:
    image_grid_set_content_panel_height_fixed();
    image_grid_set_content_to_current_group();
    break;
  case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE:
    if ( !_via_is_window_resized && _via_current_image_loaded ) {
      _via_is_window_resized = true;
      _via_show_img(_via_image_index);

      if (_via_is_canvas_zoomed) {
        reset_zoom_level();
      }
    }
    break;
  }
}

//
// Shortcut key handlers
//
