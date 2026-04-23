function _via_window_keydown_handler(e) {
  if ( e.target === document.body ) {
    // process the keyboard event
    _via_handle_global_keydown_event(e);
  }
}

// global keys are active irrespective of element focus
// arrow keys, n, p, s, o, space, d, Home, End, PageUp, PageDown
function _via_handle_global_keydown_event(e) {
  // zoom
  if (_via_current_image_loaded) {
    if ( e.key === "q") {
      zoom_in();
      return;
    }

    if ( e.key === "=") {
      reset_zoom_level();
      return;
    }

    if ( e.key === "w") {
      zoom_out();
      return;
    }
  }

  if ( e.key === 'd') {
    move_to_next_image();
    e.preventDefault();
    return;
  }

  if ( e.key === 'j') {
    document.getElementById("bim0").translate(10, 10);
    
    return;
  }

  if ( e.key === 'a') {
    move_to_prev_image();
    e.preventDefault();
    return;
  }

  if ( e.key === 'ArrowUp' ) {
    region_visualisation_update('region_label', '__via_region_id__', 1);
    e.preventDefault();
    return;
  }

  if ( e.key === 'ArrowDown' ) {
    region_visualisation_update('region_color', '__via_default_region_color__', -1);
    e.preventDefault();
    return;
  }


  if ( e.key === 'Home') {
    show_first_image();
    e.preventDefault();
    return;
  }
  if ( e.key === 'End') {
    show_last_image();
    e.preventDefault();
    return;
  }
  if ( e.key === 'PageDown') {
    jump_to_next_image_block();
    e.preventDefault();
    return;
  }
  if ( e.key === 'PageUp') {
    jump_to_prev_image_block();
    e.preventDefault();
    return;
  }



  if ( e.key === 'Escape' ) {
    e.preventDefault();
    if ( _via_is_loading_current_image ) {
      _via_cancel_current_image_loading();
    }

    if ( _via_is_user_resizing_region ) {
      // cancel region resizing action
      _via_is_user_resizing_region = false;
    }

    if ( _via_is_region_selected ) {
      // clear all region selections
      _via_is_region_selected = false;
      _via_user_sel_region_id = -1;
      toggle_all_regions_selection(false);
    }

    if ( _via_is_user_drawing_polygon ) {
      _via_is_user_drawing_polygon = false;
      _via_canvas_regions.splice(_via_current_polygon_region_id, 1);
    }

    if ( _via_is_user_drawing_region ) {
      _via_is_user_drawing_region = false;
    }

    if ( _via_is_user_resizing_region ) {
      _via_is_user_resizing_region = false
    }

    if ( _via_is_user_moving_region ) {
      _via_is_user_moving_region = false
    }

    _via_redraw_reg_canvas();
    return;
  }

  if ( e.key === ' ' ) { // Space key
    if ( e.ctrlKey ) {
      annotation_editor_toggle_on_image_editor();
    } else {
      annotation_editor_toggle_all_regions_editor();
    }
    e.preventDefault();
    return;
  }

  if ( e.key === 'F1' ) { // F1 for help
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.PAGE_GETTING_STARTED);
    e.preventDefault();
    return;
  }
  if ( e.key === 'F2' ) { // F2 for about
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.PAGE_ABOUT);
    e.preventDefault();
    return;
  }
}

function _via_reg_canvas_keyup_handler(e) {
  if ( e.key === 'Control' ) {
    _via_is_ctrl_pressed = false;
  }
}

function _via_reg_canvas_keydown_handler(e) {
  if ( e.key === 'Control' ) {
    _via_is_ctrl_pressed = true;
  }

  if (_via_current_image_loaded) {
    if ( e.key === 'Enter' ) {
        if ( _via_current_shape === VIA_REGION_SHAPE.POLYLINE ||
             _via_current_shape === VIA_REGION_SHAPE.POLYGON) {
          _via_polyshape_finish_drawing();
        }
    }
    if ( e.key === 'Backspace' ) {
        if ( _via_current_shape === VIA_REGION_SHAPE.POLYLINE ||
             _via_current_shape === VIA_REGION_SHAPE.POLYGON) {
          _via_polyshape_delete_last_vertex();
        }
    }



    if ( e.key === 'c' ) {
      if (_via_is_region_selected ||
          _via_is_all_region_selected) {
        copy_sel_regions();
      }
      e.preventDefault();
      return;
    }

    if ( e.key === 'v' ) {
      paste_sel_regions_in_current_image();
      e.preventDefault();
      return;
    }

    if ( e.key === 'b' ) {
      toggle_region_boundary_visibility();
      e.preventDefault();
      return;
    }

    if ( e.key === 'l' ) {
      toggle_region_id_visibility();
      e.preventDefault();
      return;
    }

    if ( e.key === 'e' ) {
      if ( _via_is_region_selected ||
           _via_is_all_region_selected ) {
        del_sel_regions();
      }
      e.preventDefault();
      return;
    }

    if ( _via_is_region_selected ) {
      if ( e.key === 'ArrowRight' ||
           e.key === 'ArrowLeft'  ||
           e.key === 'ArrowDown'  ||
           e.key === 'ArrowUp' ) {
        var del = 1;
        if ( e.shiftKey ) {
          del = 10;
        }
        var move_x = 0;
        var move_y = 0;
        switch( e.key ) {
        case 'ArrowLeft':
          move_x = -del;
          break;
        case 'ArrowUp':
          move_y = -del;
          break;
        case 'ArrowRight':
          move_x =  del;
          break;
        case 'ArrowDown':
          move_y =  del;
          break;
        }
        _via_move_selected_regions(move_x, move_y);
        _via_redraw_reg_canvas();
        e.preventDefault();
        return;
      }
    }
  }
  _via_handle_global_keydown_event(e);
}

function _via_polyshape_finish_drawing() {
  if ( _via_is_user_drawing_polygon ) {
    // double click is used to indicate completion of
    // polygon or polyline drawing action
    var new_region_id = _via_current_polygon_region_id;
    var new_region_shape = _via_current_shape;

    var npts =  _via_canvas_regions[new_region_id].shape_attributes['all_points_x'].length;
    if ( npts <=2 && new_region_shape === VIA_REGION_SHAPE.POLYGON ) {
      show_message('For a polygon, you must define at least 3 points. ' +
                   'Press [Esc] to cancel drawing operation.!');
      return;
    }
    if ( npts <=1 && new_region_shape === VIA_REGION_SHAPE.POLYLINE ) {
      show_message('A polyline must have at least 2 points. ' +
                   'Press [Esc] to cancel drawing operation.!');
      return;
    }

    var img_id = _via_image_id;
    _via_current_polygon_region_id = -1;
    _via_is_user_drawing_polygon = false;
    _via_is_user_drawing_region = false;

    _via_img_metadata[img_id].regions[new_region_id] = {}; // create placeholder
    _via_polyshape_add_new_polyshape(img_id, new_region_shape, new_region_id);
    select_only_region(new_region_id); // select new region
    set_region_annotations_to_default_value( new_region_id );
    annotation_editor_add_row( new_region_id );
    annotation_editor_scroll_to_row( new_region_id );

    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
  }
  return;
}

function _via_finish_polyshape_on_image_switch(target_img_index) {
  if ( !_via_current_image_loaded ) {
    return true;
  }

  if ( target_img_index === _via_image_index ) {
    return true;
  }

  if ( !_via_is_user_drawing_polygon ) {
    return true;
  }

  _via_polyshape_finish_drawing();
  return !_via_is_user_drawing_polygon;
}

function _via_polyshape_delete_last_vertex() {
  if ( _via_is_user_drawing_polygon ) {
    var npts = _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].length;
    if ( npts > 0 ) {
      _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_x'].splice(npts - 1, 1);
      _via_canvas_regions[_via_current_polygon_region_id].shape_attributes['all_points_y'].splice(npts - 1, 1);

      _via_redraw_reg_canvas();
      _via_reg_canvas.focus();
    }
  }
}

function _via_polyshape_add_new_polyshape(img_id, region_shape, region_id) {
  // add all polygon points stored in _via_canvas_regions[]
  var all_points_x = _via_canvas_regions[region_id].shape_attributes['all_points_x'].slice(0);
  var all_points_y = _via_canvas_regions[region_id].shape_attributes['all_points_y'].slice(0);

  var canvas_all_points_x = [];
  var canvas_all_points_y = [];
  var n = all_points_x.length;
  var i;
  for ( i = 0; i < n; ++i ) {
    all_points_x[i] = Math.round( all_points_x[i] * _via_canvas_scale );
    all_points_y[i] = Math.round( all_points_y[i] * _via_canvas_scale );

    canvas_all_points_x[i] = Math.round( all_points_x[i] / _via_canvas_scale );
    canvas_all_points_y[i] = Math.round( all_points_y[i] / _via_canvas_scale );
  }

  var polygon_region = new file_region();
  polygon_region.shape_attributes['name'] = region_shape;
  polygon_region.shape_attributes['all_points_x'] = all_points_x;
  polygon_region.shape_attributes['all_points_y'] = all_points_y;
  _via_img_metadata[img_id].regions[region_id] = polygon_region;

  // update canvas
  if ( img_id === _via_image_id ) {
    _via_canvas_regions[region_id].shape_attributes['name'] = region_shape;
    _via_canvas_regions[region_id].shape_attributes['all_points_x'] = canvas_all_points_x;
    _via_canvas_regions[region_id].shape_attributes['all_points_y'] = canvas_all_points_y;
  }
}

function del_sel_regions() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  if ( !_via_current_image_loaded ) {
    show_message('First load some images!');
    return;
  }

  if ( _via_is_region_selected &&
       _via_user_sel_region_id >= 0 &&
       _via_user_sel_region_id < _via_canvas_regions.length ) {
    _via_region_selected_flag[_via_user_sel_region_id] = true;
  }

  var del_region_count = 0;
  if ( _via_is_all_region_selected ) {
    del_region_count = _via_canvas_regions.length;
    _via_canvas_regions.splice(0);
    _via_img_metadata[_via_image_id].regions.splice(0);
  } else {
    var sorted_sel_reg_id = [];
    for ( var i = 0; i < _via_canvas_regions.length; ++i ) {
      if ( _via_region_selected_flag[i] ) {
        sorted_sel_reg_id.push(i);
        _via_region_selected_flag[i] = false;
      }
    }
    sorted_sel_reg_id.sort( function(a,b) {
      return (b-a);
    });
    for ( var i = 0; i < sorted_sel_reg_id.length; ++i ) {
      _via_canvas_regions.splice( sorted_sel_reg_id[i], 1);
      _via_img_metadata[_via_image_id].regions.splice( sorted_sel_reg_id[i], 1);
      del_region_count += 1;
    }

    if ( sorted_sel_reg_id.length ) {
      _via_reg_canvas.style.cursor = "default";
    }
  }

  if ( del_region_count === 0 ) {
    show_message('Select a region first!');
    return;
  }

  _via_is_all_region_selected = false;
  _via_is_region_selected     = false;
  _via_user_sel_region_id     = -1;

  if ( _via_canvas_regions.length === 0 ) {
    // all regions were deleted, hence clear region canvas
    _via_clear_reg_canvas();
  } else {
    _via_redraw_reg_canvas();
  }
  _via_reg_canvas.focus();
  annotation_editor_show();

  show_message('Deleted ' + del_region_count + ' selected regions');
}

function sel_all_regions() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_group_toggle_select_all();
    return;
  }

  if (!_via_current_image_loaded) {
    show_message('First load some images!');
    return;
  }

  toggle_all_regions_selection(true);
  _via_is_all_region_selected = true;
  _via_redraw_reg_canvas();
}

function copy_sel_regions() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  if (!_via_current_image_loaded) {
    show_message('First load some images!');
    return;
  }

  if (_via_is_region_selected ||
      _via_is_all_region_selected) {
    _via_copied_image_regions.splice(0);
    for ( var i = 0; i < _via_img_metadata[_via_image_id].regions.length; ++i ) {
      var img_region = _via_img_metadata[_via_image_id].regions[i];
      var canvas_region = _via_canvas_regions[i];
      if ( _via_region_selected_flag[i] ) {
        _via_copied_image_regions.push( clone_image_region(img_region) );
      }
    }
    show_message('Copied ' + _via_copied_image_regions.length +
                 ' selected regions. Press Ctrl + v to paste');
  } else {
    show_message('Select a region first!');
  }
}

function paste_sel_regions_in_current_image() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  if ( !_via_current_image_loaded ) {
    show_message('First load some images!');
    return;
  }

  if ( _via_copied_image_regions.length ) {
    var pasted_reg_count = 0;
    for ( var i = 0; i < _via_copied_image_regions.length; ++i ) {
      // ensure copied the regions are within this image's boundaries
      var bbox = get_region_bounding_box( _via_copied_image_regions[i] );
      if (bbox[2] < _via_current_image_width &&
          bbox[3] < _via_current_image_height) {
        var r = clone_image_region(_via_copied_image_regions[i]);
        _via_img_metadata[_via_image_id].regions.push(r);

        pasted_reg_count += 1;
      }
    }
    _via_load_canvas_regions();
    var discarded_reg_count = _via_copied_image_regions.length - pasted_reg_count;
    show_message('Pasted ' + pasted_reg_count + ' regions. ' +
                 'Discarded ' + discarded_reg_count + ' regions exceeding image boundary.');
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
  } else {
    show_message('To paste a region, you first need to select a region and copy it!');
  }
}

function paste_to_multiple_images_with_confirm() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  if ( _via_copied_image_regions.length === 0 ) {
    show_message('First copy some regions!');
    return;
  }

  var config = {'title':'Paste Regions to Multiple Images' };
  var input = { 'region_count': { type:'text', name:'Number of copied regions', value:_via_copied_image_regions.length, disabled:true },
                'prev_next_count':{ type:'text', name:'Copy to (count format)<br><span style="font-size:0.8rem">For example: to paste copied regions to the <i>previous 2 images</i> and <i>next 3 images</i>, type <strong>2,3</strong> in the textbox and to paste only in <i>next 5 images</i>, type <strong>0,5</strong></span>', placeholder:'2,3', disabled:false, size:30},
                'img_index_list':{ type:'text', name:'Copy to (image index list)<br><span style="font-size:0.8rem">For example: <strong>2-5,7,9</strong> pastes the copied regions to the images with the following id <i>2,3,4,5,7,9</i> and <strong>3,8,141</strong> pastes to the images with id <i>3,8 and 141</i></span>', placeholder:'2-5,7,9', disabled:false, size:30},
                'regex':{ type:'text', name:'Copy to filenames matching a regular expression<br><span style="font-size:0.8rem">For example: <strong>_large</strong> pastes the copied regions to all images whose filename contain the keyword <i>_large</i></span>', placeholder:'regular expression', disabled:false, size:30},
                'include_region_attributes':{ type:'checkbox', name:'Paste also the region annotations', checked:true},
              };

  invoke_with_user_inputs(paste_to_multiple_images_confirmed, input, config);
}

function paste_to_multiple_images_confirmed(input) {
  // keep a copy of user inputs for the undo operation
  _via_paste_to_multiple_images_input = input;
  var intersect = generate_img_index_list(input);
  var i;
  var total_pasted_region_count = 0;
  for ( i = 0; i < intersect.length; i++ ) {
    total_pasted_region_count += paste_regions( intersect[i] );
  }

  show_message('Pasted [' + total_pasted_region_count + '] regions ' +
               'in ' + intersect.length + ' images');

  if ( intersect.includes(_via_image_index) ) {
    _via_load_canvas_regions();
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
  }
  user_input_default_cancel_handler();
}

function paste_regions(img_index) {
  var pasted_reg_count = 0;
  if ( _via_copied_image_regions.length ) {
    var img_id = _via_image_id_list[img_index];
    var i;
    for ( i = 0; i < _via_copied_image_regions.length; ++i ) {
      var r = clone_image_region(_via_copied_image_regions[i]);
      _via_img_metadata[img_id].regions.push(r);

      pasted_reg_count += 1;
    }
  }
  return pasted_reg_count;
}


function del_sel_regions_with_confirm() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  if ( _via_copied_image_regions.length === 0 ) {
    show_message('First copy some regions!');
    return;
  }

  var prev_next_count, img_index_list, regex;
  if ( _via_paste_to_multiple_images_input ) {
    prev_next_count = _via_paste_to_multiple_images_input.prev_next_count.value;
    img_index_list  = _via_paste_to_multiple_images_input.img_index_list.value;
    regex = _via_paste_to_multiple_images_input.regex.value;
  }

  var config = {'title':'Undo Regions Pasted to Multiple Images' };
  var input = { 'region_count': { type:'text', name:'Number of regions selected', value:_via_copied_image_regions.length, disabled:true },
                'prev_next_count':{ type:'text', name:'Delete from (count format)<br><span style="font-size:0.8rem">For example: to delete copied regions from the <i>previous 2 images</i> and <i>next 3 images</i>, type <strong>2,3</strong> in the textbox and to delete regions only in <i>next 5 images</i>, type <strong>0,5</strong></span>', placeholder:'2,3', disabled:false, size:30, value:prev_next_count},
                'img_index_list':{ type:'text', name:'Delete from (image index list)<br><span style="font-size:0.8rem">For example: <strong>2-5,7,9</strong> deletes the copied regions to the images with the following id <i>2,3,4,5,7,9</i> and <strong>3,8,141</strong> deletes regions from the images with id <i>3,8 and 141</i></span>', placeholder:'2-5,7,9', disabled:false, size:30, value:img_index_list},
                'regex':{ type:'text', name:'Delete from filenames matching a regular expression<br><span style="font-size:0.8rem">For example: <strong>_large</strong> deletes the copied regions from all images whose filename contain the keyword <i>_large</i></span>', placeholder:'regular expression', disabled:false, size:30, value:regex},
              };

  invoke_with_user_inputs(del_sel_regions_confirmed, input, config);
}

function del_sel_regions_confirmed(input) {
  user_input_default_cancel_handler();
  var intersect = generate_img_index_list(input);
  var i;
  var total_deleted_region_count = 0;
  for ( i = 0; i < intersect.length; i++ ) {
    total_deleted_region_count += delete_regions( intersect[i] );
  }

  show_message('Deleted [' + total_deleted_region_count + '] regions ' +
               'in ' + intersect.length + ' images');

  if ( intersect.includes(_via_image_index) ) {
    _via_load_canvas_regions();
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
  }
}

function delete_regions(img_index) {
  var del_region_count = 0;
  if ( _via_copied_image_regions.length ) {
    var img_id = _via_image_id_list[img_index];
    var i;
    for ( i = 0; i < _via_copied_image_regions.length; ++i ) {
      var copied_region_shape_str = JSON.stringify(_via_copied_image_regions[i].shape_attributes);
      var j;
      // start from last region in order to delete the last pasted region
      for ( j = _via_img_metadata[img_id].regions.length-1; j >= 0; --j ) {
        if ( JSON.stringify(_via_img_metadata[img_id].regions[j].shape_attributes) === copied_region_shape_str ) {
          _via_img_metadata[img_id].regions.splice( j, 1);
          del_region_count += 1;
          break; // delete only one matching region
        }
      }
    }
  }
  return del_region_count;
}

function show_first_image() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_image_grid_group_var.length ) {
      image_grid_group_prev( { 'value':0 } ); // simulate button click
    } else {
      show_message('First, create groups by selecting items from "Group by" dropdown list');
    }
    return;
  }

  if (_via_img_count > 0) {
    _via_show_img( _via_img_fn_list_img_index_list[0] );
  }
}

function show_last_image() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_image_grid_group_var.length ) {
      image_grid_group_prev( { 'value':_via_image_grid_group_var.length-1 } ); // simulate button click
    } else {
      show_message('First, create groups by selecting items from "Group by" dropdown list');
    }
    return;
  }

  if (_via_img_count > 0) {
    var last_img_index = _via_img_fn_list_img_index_list.length - 1;
    _via_show_img( _via_img_fn_list_img_index_list[ last_img_index ] );
  }
}

function jump_image_block_get_count() {
  var n = _via_img_fn_list_img_index_list.length;
  if ( n < 20 ) {
    return 2;
  }
  if ( n < 100 ) {
    return 10;
  }
  if ( n < 1000 ) {
    return 25;
  }
  if ( n < 5000 ) {
    return 50;
  }
  if ( n < 10000 ) {
    return 100;
  }
  if ( n < 50000 ) {
    return 500;
  }

  return Math.round( n / 50 );
}

function jump_to_next_image_block() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  var jump_count = jump_image_block_get_count();
  if ( jump_count > 1 ) {
    var current_img_index = _via_image_index;
    if ( _via_img_fn_list_img_index_list.includes( current_img_index ) ) {
      var list_index = _via_img_fn_list_img_index_list.indexOf( current_img_index );
      var next_list_index = list_index + jump_count;
      if ( (next_list_index + 1) > _via_img_fn_list_img_index_list.length ) {
        next_list_index = 0;
      }
      var next_img_index = _via_img_fn_list_img_index_list[next_list_index];
      _via_show_img(next_img_index);
    }
  } else {
    move_to_next_image();
  }
}

function jump_to_prev_image_block() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    return;
  }

  var jump_count = jump_image_block_get_count();
  if ( jump_count > 1 ) {
    var current_img_index = _via_image_index;
    if ( _via_img_fn_list_img_index_list.includes( current_img_index ) ) {
      var list_index = _via_img_fn_list_img_index_list.indexOf( current_img_index );
      var prev_list_index = list_index - jump_count;
      if ( prev_list_index < 0 ) {
        prev_list_index = _via_img_fn_list_img_index_list.length - 1;
      }
      var prev_img_index = _via_img_fn_list_img_index_list[prev_list_index];
      _via_show_img(prev_img_index);
    }
  } else {
    move_to_prev_image();
  }
}

function move_to_prev_image() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_image_grid_group_var.length ) {
      var last_group_index = _via_image_grid_group_var.length - 1;
      image_grid_group_prev( { 'value':last_group_index } ); // simulate button click
    } else {
      show_message('First, create groups by selecting items from "Group by" dropdown list');
    }
    return;
  }

  if (_via_img_count > 0) {
    var current_img_index = _via_image_index;
    if ( _via_img_fn_list_img_index_list.includes( current_img_index ) ) {
      var list_index = _via_img_fn_list_img_index_list.indexOf( current_img_index );
      var next_list_index = list_index - 1;
      if ( next_list_index === -1 ) {
        next_list_index = _via_img_fn_list_img_index_list.length - 1;
      }
      var next_img_index = _via_img_fn_list_img_index_list[next_list_index];
      _via_show_img(next_img_index);
    } else {
      if ( _via_img_fn_list_img_index_list.length === 0 ) {
        show_message('Filtered file list does not any files!');
      } else {
        _via_show_img( _via_img_fn_list_img_index_list[0] );
      }
    }

    if (typeof _via_hook_prev_image === 'function') {
      _via_hook_prev_image(current_img_index);
    }
  }
}

function move_to_next_image() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_image_grid_group_var.length ) {
      var last_group_index = _via_image_grid_group_var.length - 1;
      image_grid_group_next( { 'value':last_group_index } ); // simulate button click
    } else {
      show_message('First, create groups by selecting items from "Group by" dropdown list');
    }
    return;
  }

  if (_via_img_count > 0) {
    var current_img_index = _via_image_index;
    if ( _via_img_fn_list_img_index_list.includes( current_img_index ) ) {
      var list_index = _via_img_fn_list_img_index_list.indexOf( current_img_index );
      var next_list_index = list_index + 1;
      if ( next_list_index === _via_img_fn_list_img_index_list.length ) {
        next_list_index = 0;
      }
      var next_img_index = _via_img_fn_list_img_index_list[next_list_index];
      _via_show_img(next_img_index);
    } else {
      if ( _via_img_fn_list_img_index_list.length === 0 ) {
        show_message('Filtered file list does not contain any files!');
      } else {
        _via_show_img( _via_img_fn_list_img_index_list[0] );
      }
    }

    if (typeof _via_hook_next_image === 'function') {
      _via_hook_next_image(current_img_index);
    }
  }
}

function set_zoom(zoom_level_index) {
  if ( zoom_level_index === VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX ) {
    _via_is_canvas_zoomed = false;
    _via_canvas_zoom_level_index = VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX;
  } else {
    _via_is_canvas_zoomed = true;
    _via_canvas_zoom_level_index = zoom_level_index;
  }

  var zoom_scale = VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index];
  set_all_canvas_scale(zoom_scale);
  var canvas_w = ( _via_current_image.naturalWidth  * zoom_scale ) / _via_canvas_scale_without_zoom;
  var canvas_h = ( _via_current_image.naturalHeight * zoom_scale ) / _via_canvas_scale_without_zoom;
  set_all_canvas_size(canvas_w, canvas_h);
  _via_canvas_scale = _via_canvas_scale_without_zoom / zoom_scale;
  _via_canvas_scale = _via_canvas_scale_without_zoom / zoom_scale;

  if ( zoom_scale === 1 ) {
    VIA_REGION_POINT_RADIUS = VIA_REGION_POINT_RADIUS_DEFAULT;
  } else {
    if ( zoom_scale > 1 ) {
      VIA_REGION_POINT_RADIUS = VIA_REGION_POINT_RADIUS_DEFAULT * zoom_scale;
    }
  }

  _via_load_canvas_regions(); // image to canvas space transform
  _via_redraw_reg_canvas();
  _via_reg_canvas.focus();
  update_vertical_space();
}

function reset_zoom_level() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_image_size_reset();
    show_message('Zoom reset');
    return;
  }

  if (!_via_current_image_loaded) {
    show_message('First load some images!');
    return;
  }

  if (_via_is_canvas_zoomed) {
    set_zoom(VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX);
    show_message('Zoom reset');
  } else {
    show_message('Cannot reset zoom because image zoom has not been applied!');
  }
  update_vertical_space();
}

