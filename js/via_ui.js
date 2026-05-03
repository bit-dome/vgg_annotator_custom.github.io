function zoom_in() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_image_size_increase();
    show_message('Increased size of images shown in image grid');
    return;
  }

  if (!_via_current_image_loaded) {
    show_message('First load some images!');
    return;
  }

  if ( _via_is_user_drawing_polygon || _via_is_user_drawing_region ) {
    return;
  }

  if (_via_canvas_zoom_level_index === (VIA_CANVAS_ZOOM_LEVELS.length-1)) {
    show_message('Further zoom-in not possible');
  } else {
    var new_zoom_level_index = _via_canvas_zoom_level_index + 1;
    set_zoom( new_zoom_level_index );
    show_message('Zoomed in to level ' + VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index] + 'X');
  }
}

function zoom_out() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_image_size_decrease();
    show_message('Reduced size of images shown in image grid');
    return;
  }

  if (!_via_current_image_loaded) {
    show_message('First load some images!');
    return;
  }

  if ( _via_is_user_drawing_polygon || _via_is_user_drawing_region ) {
    return;
  }

  if (_via_canvas_zoom_level_index === 0) {
    show_message('Further zoom-out not possible');
  } else {
    var new_zoom_level_index = _via_canvas_zoom_level_index - 1;
    set_zoom( new_zoom_level_index );
    show_message('Zoomed out to level ' + VIA_CANVAS_ZOOM_LEVELS[_via_canvas_zoom_level_index] + 'X');
  }
}

function toggle_region_boundary_visibility() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE ) {
    _via_is_region_boundary_visible = !_via_is_region_boundary_visible;
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();
  }

  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_settings.ui.image_grid.show_region_shape ) {
      _via_settings.ui.image_grid.show_region_shape = false;
      document.getElementById('image_grid_content_rshape').innerHTML = '';
    } else {
      _via_settings.ui.image_grid.show_region_shape = true;
      image_grid_page_show_all_regions();
    }
  }
}

function toggle_region_id_visibility() {
  _via_is_region_id_visible = !_via_is_region_id_visible;
  _via_redraw_reg_canvas();
  _via_reg_canvas.focus();
}

function toggle_region_info_visibility() {
  var elem = document.getElementById('region_info');
  // toggle between displaying and not displaying
  if ( elem.classList.contains('display_none') ) {
    elem.classList.remove('display_none');
    _via_is_region_info_visible = true;
  } else {
    elem.classList.add('display_none');
    _via_is_region_info_visible = false;
  }
}

//
// Mouse wheel event listener
//
function _via_reg_canvas_mouse_wheel_listener(e) {
  if (!_via_current_image_loaded) {
    return;
  }

  if (_via_mask_mode) {
    // Scroll up = bigger brush, scroll down = smaller brush
    mask_brush_size_change(e.deltaY < 0 ? 2 : -2);
    e.preventDefault();
    return;
  }

  if ( e.ctrlKey ) {
    // perform zoom
    if (e.deltaY < 0) {
      zoom_in();
    } else {
      zoom_out();
    }
    e.preventDefault();
  }
}

function region_visualisation_update(type, default_id, next_offset) {
  var attr_list = [ default_id ];
  attr_list = attr_list.concat(Object.keys(_via_attributes['region']));
  var n = attr_list.length;
  var current_index = attr_list.indexOf(_via_settings.ui.image[type]);
  var new_index;
  if ( current_index !== -1 ) {
    new_index = current_index + next_offset;

    if ( new_index < 0 ) {
      new_index = n + new_index;
    }
    if ( new_index >= n ) {
      new_index = new_index - n;
    }
    switch(type) {
    case 'region_label':
      _via_settings.ui.image.region_label = attr_list[new_index];
      _via_redraw_reg_canvas();
      break;
    case 'region_color':
      _via_settings.ui.image.region_color = attr_list[new_index];
      _via_regions_group_color_init();
      _via_redraw_reg_canvas();
    }

    var type_str = type.replace('_', ' ');
    if ( _via_settings.ui.image[type].startsWith('__via') ) {
      show_message(type_str + ' cleared');
    } else {
      show_message(type_str + ' set to region attribute [' + _via_settings.ui.image[type] + ']');
    }
  }
}

//
// left sidebar toolbox maintainer
//
function leftsidebar_toggle() {
  var leftsidebar = document.getElementById('leftsidebar');
  if ( leftsidebar.style.display === 'none' ) {
    leftsidebar.style.display = 'table-cell';
    document.getElementById('leftsidebar_collapse_panel').style.display = 'none';
  } else {
    leftsidebar.style.display = 'none';
    document.getElementById('leftsidebar_collapse_panel').style.display = 'table-cell';
  }
  _via_update_ui_components();
}

function leftsidebar_increase_width() {
  var leftsidebar = document.getElementById('leftsidebar');
  var new_width = _via_settings.ui.leftsidebar_width + VIA_LEFTSIDEBAR_WIDTH_CHANGE;
  leftsidebar.style.width = new_width + 'rem';
  _via_settings.ui.leftsidebar_width = new_width;
  if ( _via_current_image_loaded ) {
    _via_show_img(_via_image_index);
  }
}

function leftsidebar_decrease_width() {
  var leftsidebar = document.getElementById('leftsidebar');
  var new_width = _via_settings.ui.leftsidebar_width - VIA_LEFTSIDEBAR_WIDTH_CHANGE;
  if ( new_width >= 5 ) {
    leftsidebar.style.width = new_width + 'rem';
    _via_settings.ui.leftsidebar_width = new_width;
    if ( _via_current_image_loaded ) {
      _via_show_img(_via_image_index);
    }
  }
}

function leftsidebar_show() {
  var leftsidebar = document.getElementById('leftsidebar');
  leftsidebar.style.display = 'table-cell';
  document.getElementById('leftsidebar_collapse_panel').style.display = 'none';
}

// source: https://www.w3schools.com/howto/howto_js_accordion.asp
function init_leftsidebar_accordion() {
  var leftsidebar = document.getElementById('leftsidebar');
  leftsidebar.style.width = _via_settings.ui.leftsidebar_width + 'rem';

  var acc = document.getElementsByClassName('leftsidebar_accordion');
  var i;
  for ( i = 0; i < acc.length; ++i ) {
    acc[i].addEventListener('click', function() {
      update_vertical_space();
      this.classList.toggle('active');
      this.nextElementSibling.classList.toggle('show');

      switch( this.innerHTML ) {
      case 'Attributes':
        update_attributes_update_panel();
        break;
      case 'Project':
        update_img_fn_list();
        break;
      }
    });
  }
}

//
// image filename list shown in leftsidebar panel
//
function is_img_fn_list_visible() {
  return img_fn_list_panel.classList.contains('show');
}

function img_loading_spinbar(image_index, show) {
  var panel = document.getElementById('project_panel_title');
  if ( show ) {
    panel.innerHTML = 'Project <span style="margin-left:1rem;" class="loading_spinbox"></span>';
  } else {
    panel.innerHTML = 'Project';
  }
}

function update_img_fn_list() {
  var regex = document.getElementById('img_fn_list_regex').value;
  var p = document.getElementById('filelist_preset_filters_list');
  if ( regex === '' || regex === null ) {
    if ( p.selectedIndex === 0 ) {
      // show all files
      _via_img_fn_list_html = [];
      _via_img_fn_list_img_index_list = [];
      _via_img_fn_list_html.push('<ul>');
      for ( var i=0; i < _via_image_filename_list.length; ++i ) {
        _via_img_fn_list_html.push( img_fn_list_ith_entry_html(i) );
        _via_img_fn_list_img_index_list.push(i);
      }
      _via_img_fn_list_html.push('</ul>');
      img_fn_list.innerHTML = _via_img_fn_list_html.join('');
      img_fn_list_scroll_to_current_file();
    } else {
      // filter according to preset filters
      img_fn_list_onpresetfilter_select();
    }
  } else {
    img_fn_list_generate_html(regex);
    img_fn_list.innerHTML = _via_img_fn_list_html.join('');
    img_fn_list_scroll_to_current_file();
  }
}

function img_fn_list_onregex() {
  var regex = document.getElementById('img_fn_list_regex').value;
  img_fn_list_generate_html( regex );
  img_fn_list.innerHTML = _via_img_fn_list_html.join('');
  img_fn_list_scroll_to_current_file();

  // select 'regex' in the predefined filter list
  var p = document.getElementById('filelist_preset_filters_list');
  if ( regex === '' ) {
    p.selectedIndex = 0;
  } else {
    var i;
    for ( i=0; i<p.options.length; ++i ) {
      if ( p.options[i].value === 'regex' ) {
        p.selectedIndex = i;
        break;
      }
    }
  }
}

function img_fn_list_onpresetfilter_select() {
  var p = document.getElementById('filelist_preset_filters_list');
  var filter = p.options[p.selectedIndex].value;
  switch(filter) {
  case 'all':
    document.getElementById('img_fn_list_regex').value = '';
    img_fn_list_generate_html();
    img_fn_list.innerHTML = _via_img_fn_list_html.join('');
    img_fn_list_scroll_to_current_file();
    break;
  case 'regex':
    document.getElementById('img_fn_list_regex').focus();
    break;
  default:
    _via_img_fn_list_html = [];
    _via_img_fn_list_img_index_list = [];
    _via_img_fn_list_html.push('<ul>');
    var i;
    for ( i=0; i < _via_image_filename_list.length; ++i ) {
      var img_id = _via_image_id_list[i];
      var add_to_list = false;
      switch(filter) {
      case 'files_without_region':
        if ( _via_img_metadata[img_id].regions.length === 0 ) {
          add_to_list = true;
        }
        break;
      case 'files_missing_region_annotations':
        if ( is_region_annotation_missing(img_id) ) {
          add_to_list = true;
        }
        break;
      case 'files_missing_file_annotations':
        if ( is_file_annotation_missing(img_id) ) {
          add_to_list = true;
        }
        break;
      case 'files_error_loading':
        if ( _via_image_load_error[i] === true ) {
          add_to_list = true;
        }
      }
      if ( add_to_list ) {
        _via_img_fn_list_html.push( img_fn_list_ith_entry_html(i) );
        _via_img_fn_list_img_index_list.push(i);
      }
    }
    _via_img_fn_list_html.push('</ul>');
    img_fn_list.innerHTML = _via_img_fn_list_html.join('');
    img_fn_list_scroll_to_current_file();
    break;
  }
}

function is_region_annotation_missing(img_id) {
  var region_attribute;
  var i;
  for ( i = 0; i < _via_img_metadata[img_id].regions.length; ++i ) {
    for ( region_attribute in _via_attributes['region'] ) {
      if ( _via_img_metadata[img_id].regions[i].region_attributes.hasOwnProperty(region_attribute) ) {
        if ( _via_img_metadata[img_id].regions[i].region_attributes[region_attribute] === '' ) {
          return true;
        }
      } else {
        return true;
      }
    }
  }
  return false;
}

function is_file_annotation_missing(img_id) {
  var file_attribute;
  for ( file_attribute in _via_attributes['file'] ) {
    if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty(file_attribute) ) {
      if ( _via_img_metadata[img_id].file_attributes[file_attribute] === '' ) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
}

function img_fn_list_ith_entry_selected(img_index, is_selected) {
  if ( is_selected ) {
    img_fn_list_ith_entry_add_css_class(img_index, 'sel');
  } else {
    img_fn_list_ith_entry_remove_css_class(img_index, 'sel');
  }
}

function img_fn_list_ith_entry_error(img_index, is_error) {
  if ( is_error ) {
    img_fn_list_ith_entry_add_css_class(img_index, 'error');
  } else {
    img_fn_list_ith_entry_remove_css_class(img_index, 'error');
  }
}

function img_fn_list_ith_entry_add_css_class(img_index, classname) {
  var li = document.getElementById('fl' + img_index);
  if ( li && ! li.classList.contains(classname)  ) {
    li.classList.add(classname);
  }
}

function img_fn_list_ith_entry_remove_css_class(img_index, classname) {
  var li = document.getElementById('fl' + img_index);
  if ( li && li.classList.contains(classname) ) {
    li.classList.remove(classname);
  }
}

function img_fn_list_clear_all_style() {
  var cn = document.getElementById('img_fn_list').childNodes[0].childNodes;
  var i, j;
  var n = cn.length;
  var nclass;
  for ( i = 0; i < n; ++i ) {
    //cn[i].classList = []; // throws error in Edge browser
    nclass = cn[i].classList.length;
    if ( nclass ) {
      for ( j = 0; j < nclass; ++j ) {
        cn[i].classList.remove( cn[i].classList.item(j) );
      }
    }
  }
}

function img_fn_list_clear_css_classname(classname) {
  var cn = document.getElementById('img_fn_list').childNodes[0].childNodes;
  var i;
  var n = cn.length;
  for ( i = 0; i < n; ++i ) {
    if ( cn[i].classList.contains(classname) ) {
      cn[i].classList.remove(classname);
    }
  }
}

function img_fn_list_ith_entry_html(i) {
  var htmli = '';
  var filename = _via_image_filename_list[i];
  if ( is_url(filename) ) {
    filename = filename.substr(0,4) + '...' + get_filename_from_url(filename);
  }

  htmli += '<li id="fl' + i + '"';
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( _via_image_grid_page_img_index_list.includes(i) ) {
      // highlight images being shown in image grid
      htmli += ' class="sel"';
    }

  } else {
    if ( i === _via_image_index ) {
      // highlight the current entry
      htmli += ' class="sel"';
    }
  }
  htmli += ' onclick="jump_to_image(' + (i) + ')" title="' + _via_image_filename_list[i] + '">[' + (i+1) + '] ' + decodeURIComponent(filename) + '</li>';
  return htmli;
}

function img_fn_list_generate_html(regex) {
  _via_img_fn_list_html = [];
  _via_img_fn_list_img_index_list = [];
  _via_img_fn_list_html.push('<ul>');
  for ( var i=0; i < _via_image_filename_list.length; ++i ) {
    var filename = _via_image_filename_list[i];
    if ( filename.match(regex) !== null ) {
      _via_img_fn_list_html.push( img_fn_list_ith_entry_html(i) );
      _via_img_fn_list_img_index_list.push(i);
    }
  }
  _via_img_fn_list_html.push('</ul>');
}

function img_fn_list_scroll_to_current_file() {
  img_fn_list_scroll_to_file( _via_image_index );
}

function img_fn_list_scroll_to_file(file_index) {
  if( _via_img_fn_list_img_index_list.includes(file_index) ) {
    var sel_file     = document.getElementById( 'fl' + file_index );
    var panel_height = img_fn_list.clientHeight - 20;
    var window_top    = img_fn_list.scrollTop;
    var window_bottom = img_fn_list.scrollTop + panel_height
    if ( sel_file.offsetTop > window_top ) {
      if ( sel_file.offsetTop > window_bottom ) {
        img_fn_list.scrollTop = sel_file.offsetTop;
      }
    } else {
      img_fn_list.scrollTop = sel_file.offsetTop - panel_height;
    }
  }
}

function toggle_img_fn_list_visibility() {
  leftsidebar_show();
  document.getElementById('img_fn_list_panel').classList.toggle('show');
  document.getElementById('project_panel_title').classList.toggle('active');
}

function toggle_attributes_editor() {
  leftsidebar_show();
  document.getElementById('attributes_editor_panel').classList.toggle('show');
  document.getElementById('attributes_editor_panel_title').classList.toggle('active');
}

// this spacer is no longer needed for bottom panel; kept for compatibility
function update_vertical_space() {
  var panel = document.getElementById('vertical_space');
  var aepanel = document.getElementById('annotation_editor_panel');
  panel.style.height = '0px';
  var display_area = document.getElementById('display_area');
  if ( aepanel.classList.contains('display_block') ) {
    display_area.style.paddingRight = aepanel.offsetWidth + 'px';
  } else {
    display_area.style.paddingRight = '';
  }
}

//
// region and file attributes update panel
//
function attribute_update_panel_set_active_button() {
  var attribute_type;
  for ( attribute_type in _via_attributes ) {
    var bid = 'button_show_' + attribute_type + '_attributes';
    document.getElementById(bid).classList.remove('active');
  }
  var bid = 'button_show_' + _via_attribute_being_updated + '_attributes';
  document.getElementById(bid).classList.add('active');
}

function show_region_attributes_update_panel() {
  _via_attribute_being_updated = 'region';
  var rattr_list = Object.keys(_via_attributes['region']);
  if ( rattr_list.length ) {
    _via_current_attribute_id = rattr_list[0];
  } else {
    _via_current_attribute_id = '';
  }
  update_attributes_update_panel();
  attribute_update_panel_set_active_button();

}

function show_file_attributes_update_panel() {
  _via_attribute_being_updated = 'file';
  var fattr_list = Object.keys(_via_attributes['file']);
  if ( fattr_list.length ) {
    _via_current_attribute_id = fattr_list[0];
  } else {
    _via_current_attribute_id = '';
  }
  update_attributes_update_panel();
  attribute_update_panel_set_active_button();
}

function update_attributes_name_list() {
  var p = document.getElementById('attributes_name_list');
  p.innerHTML = '';

  var attr;
  for ( attr in _via_attributes[_via_attribute_being_updated] ) {
    var option = document.createElement('option');
    option.setAttribute('value', attr)
    option.innerHTML = attr;
    if ( attr === _via_current_attribute_id ) {
      option.setAttribute('selected', 'selected');
    }
    p.appendChild(option);
  }
}

function update_attributes_update_panel() {
  if ( document.getElementById('attributes_editor_panel').classList.contains('show') ) {
    update_attributes_name_list();
    show_attribute_properties();
    show_attribute_options();
  }
}

function update_attribute_properties_panel() {
  if ( document.getElementById('attributes_editor_panel').classList.contains('show') ) {
    show_attribute_properties();
    show_attribute_options();
  }
}

function show_attribute_properties() {
  var attr_list = document.getElementById('attributes_name_list');
  document.getElementById('attribute_properties').innerHTML = '';

  if ( attr_list.options.length === 0 ) {
    return;
  }

  if ( typeof(_via_current_attribute_id) === 'undefined' || _via_current_attribute_id === '' ) {
    _via_current_attribute_id = attr_list.options[0].value;
  }

  var attr_id = _via_current_attribute_id;
  var attr_type = _via_attribute_being_updated;
  var attr_input_type = _via_attributes[attr_type][attr_id].type;
  var attr_desc = _via_attributes[attr_type][attr_id].description;

  attribute_property_add_input_property('Name of attribute (appears in exported annotations)',
                                        'Name',
                                        attr_id,
                                        'attribute_name');
  attribute_property_add_input_property('Description of attribute (shown to user during annotation session)',
                                        'Desc.',
                                        attr_desc,
                                        'attribute_description');

  if ( attr_input_type === 'text' ) {
    var attr_default_value = _via_attributes[attr_type][attr_id].default_value;
    attribute_property_add_input_property('Default value of this attribute',
                                          'Def.',
                                          attr_default_value,
                                          'attribute_default_value');
  }

  // add dropdown for type of attribute
  var p = document.createElement('div');
  p.setAttribute('class', 'property');
  var c0 = document.createElement('span');
  c0.setAttribute('title', 'Attribute type (e.g. text, checkbox, radio, etc)');
  c0.innerHTML = 'Type';
  var c1 = document.createElement('span');
  var c1b = document.createElement('select');
  c1b.setAttribute('onchange', 'attribute_property_on_update(this)');
  c1b.setAttribute('id', 'attribute_type');
  var type_id;
  for ( type_id in VIA_ATTRIBUTE_TYPE ) {
    var type = VIA_ATTRIBUTE_TYPE[type_id];
    var option = document.createElement('option');
    option.setAttribute('value', type);
    option.innerHTML = type;
    if ( attr_input_type == type ) {
      option.setAttribute('selected', 'selected');
    }
    c1b.appendChild(option);
  }
  c1.appendChild(c1b);
  p.appendChild(c0);
  p.appendChild(c1);
  document.getElementById('attribute_properties').appendChild(p);
}

function show_attribute_options() {
  var attr_list = document.getElementById('attributes_name_list');
  document.getElementById('attribute_options').innerHTML = '';
  if ( attr_list.options.length === 0 ) {
    return;
  }

  var attr_id = attr_list.value;
  var attr_type = _via_attributes[_via_attribute_being_updated][attr_id].type;

  // populate additional options based on attribute type
  switch( attr_type ) {
  case VIA_ATTRIBUTE_TYPE.TEXT:
    // text does not have any additional properties
    break;
  case VIA_ATTRIBUTE_TYPE.IMAGE:
    var p = document.createElement('div');
    p.setAttribute('class', 'property');
    p.setAttribute('style', 'text-align:center');
    var c0 = document.createElement('span');
    c0.setAttribute('style', 'width:25%');
    c0.setAttribute('title', 'When selected, this is the value that appears in exported annotations');
    c0.innerHTML = 'id';
    var c1 = document.createElement('span');
    c1.setAttribute('style', 'width:60%');
    c1.setAttribute('title', 'URL or base64 (see https://www.base64-image.de/) encoded image data that corresponds to the image shown as an option to the annotator');
    c1.innerHTML = 'image url or b64';
    var c2 = document.createElement('span');
    c2.setAttribute('title', 'The default value of this attribute');
    c2.innerHTML = 'def.';
    p.appendChild(c0);
    p.appendChild(c1);
    p.appendChild(c2);
    document.getElementById('attribute_options').appendChild(p);

    var options = _via_attributes[_via_attribute_being_updated][attr_id].options;
    var option_id;
    for ( option_id in options ) {
      var option_desc = options[option_id];

      var option_default = _via_attributes[_via_attribute_being_updated][attr_id].default_options[option_id];
      attribute_property_add_option(attr_id, option_id, option_desc, option_default, attr_type);
    }
    attribute_property_add_new_entry_option(attr_id, attr_type);
    break;
  case VIA_ATTRIBUTE_TYPE.CHECKBOX: // handled by next case
  case VIA_ATTRIBUTE_TYPE.DROPDOWN: // handled by next case
  case VIA_ATTRIBUTE_TYPE.RADIO:
    var p = document.createElement('div');
    p.setAttribute('class', 'property');
    p.setAttribute('style', 'text-align:center');
    var c0 = document.createElement('span');
    c0.setAttribute('style', 'width:25%');
    c0.setAttribute('title', 'When selected, this is the value that appears in exported annotations');
    c0.innerHTML = 'id';
    var c1 = document.createElement('span');
    c1.setAttribute('style', 'width:60%');
    c1.setAttribute('title', 'This is the text shown as an option to the annotator');
    c1.innerHTML = 'description';
    var c2 = document.createElement('span');
    c2.setAttribute('title', 'The default value of this attribute');
    c2.innerHTML = 'def.';
    p.appendChild(c0);
    p.appendChild(c1);
    p.appendChild(c2);
    document.getElementById('attribute_options').appendChild(p);

    var options = _via_attributes[_via_attribute_being_updated][attr_id].options;
    var option_id;
    for ( option_id in options ) {
      var option_desc = options[option_id];

      var option_default = _via_attributes[_via_attribute_being_updated][attr_id].default_options[option_id];
      attribute_property_add_option(attr_id, option_id, option_desc, option_default, attr_type);
    }
    attribute_property_add_new_entry_option(attr_id, attr_type);
    break;
  default:
    console.log('Attribute type ' + attr_type + ' is unavailable');
  }
}

function attribute_property_add_input_property(title, name, value, id) {
  var p = document.createElement('div');
  p.setAttribute('class', 'property');
  var c0 = document.createElement('span');
  c0.setAttribute('title', title);
  c0.innerHTML = name;
  var c1 = document.createElement('span');
  var c1b = document.createElement('input');
  c1b.setAttribute('onchange', 'attribute_property_on_update(this)');
  if ( typeof(value) !== 'undefined' ) {
    c1b.setAttribute('value', value);
  }
  c1b.setAttribute('id', id);
  c1.appendChild(c1b);
  p.appendChild(c0);
  p.appendChild(c1);

  document.getElementById('attribute_properties').appendChild(p);
}

function attribute_property_add_option(attr_id, option_id, option_desc, option_default, attribute_type) {
  var p = document.createElement('div');
  p.setAttribute('class', 'property');
  var c0 = document.createElement('span');
  var c0b = document.createElement('input');
  c0b.setAttribute('type', 'text');
  c0b.setAttribute('value', option_id);
  c0b.setAttribute('title', option_id);
  c0b.setAttribute('onchange', 'attribute_property_on_option_update(this)');
  c0b.setAttribute('id', '_via_attribute_option_id_' + option_id);

  var c1 = document.createElement('span');
  var c1b = document.createElement('input');
  c1b.setAttribute('type', 'text');

  if ( attribute_type === VIA_ATTRIBUTE_TYPE.IMAGE ) {
    var option_desc_info = option_desc.length + ' bytes of base64 image data';
    c1b.setAttribute('value', option_desc_info);
    c1b.setAttribute('title', 'To update, copy and paste base64 image data in this text box');
  } else {
    c1b.setAttribute('value', option_desc);
    c1b.setAttribute('title', option_desc);
  }
  c1b.setAttribute('onchange', 'attribute_property_on_option_update(this)');
  c1b.setAttribute('id', '_via_attribute_option_description_' + option_id);

  var c2 = document.createElement('span');
  var c2b = document.createElement('input');
  c2b.setAttribute('type', attribute_type);
  if ( typeof option_default !== 'undefined' ) {
    c2b.checked = option_default;
  }
  if ( attribute_type === 'radio' || attribute_type === 'image' || attribute_type === 'dropdown' ) {
    // ensured that user can activate only one radio button
    c2b.setAttribute('type', 'radio');
    c2b.setAttribute('name', attr_id);
  }

  c2b.setAttribute('onchange', 'attribute_property_on_option_update(this)');
  c2b.setAttribute('id', '_via_attribute_option_default_' + option_id);

  c0.appendChild(c0b);
  c1.appendChild(c1b);
  c2.appendChild(c2b);
  p.appendChild(c0);
  p.appendChild(c1);
  p.appendChild(c2);

  document.getElementById('attribute_options').appendChild(p);
}

function attribute_property_add_new_entry_option(attr_id, attribute_type) {
  var p = document.createElement('div');
  p.setAttribute('class', 'new_option_id_entry');
  var c0b = document.createElement('input');
  c0b.setAttribute('type', 'text');
  c0b.setAttribute('onchange', 'attribute_property_on_option_add(this)');
  c0b.setAttribute('id', '_via_attribute_new_option_id');
  c0b.setAttribute('placeholder', 'Add new option id');
  p.appendChild(c0b);
  document.getElementById('attribute_options').appendChild(p);
}

function attribute_property_on_update(p) {
  var attr_id = get_current_attribute_id();
  var attr_type = _via_attribute_being_updated;
  var new_attr_type = p.value;

  switch(p.id) {
  case 'attribute_name':
    if ( new_attr_type !== attr_id ) {
      Object.defineProperty(_via_attributes[attr_type],
                            new_attr_type,
                            Object.getOwnPropertyDescriptor(_via_attributes[attr_type], attr_id));

      delete _via_attributes[attr_type][attr_id];
      update_attributes_update_panel();
      annotation_editor_update_content();
    }
    break;
  case 'attribute_description':
    _via_attributes[attr_type][attr_id].description = new_attr_type;
    update_attributes_update_panel();
    annotation_editor_update_content();
    break;
  case 'attribute_default_value':
    _via_attributes[attr_type][attr_id].default_value = new_attr_type;
    update_attributes_update_panel();
    annotation_editor_update_content();
    break;
  case 'attribute_type':
    var old_attr_type = _via_attributes[attr_type][attr_id].type;
    _via_attributes[attr_type][attr_id].type = new_attr_type;
    if( new_attr_type === VIA_ATTRIBUTE_TYPE.TEXT ) {
      _via_attributes[attr_type][attr_id].default_value = '';
      delete _via_attributes[attr_type][attr_id].options;
      delete _via_attributes[attr_type][attr_id].default_options;
    } else {
      // add options entry (if missing)
      if ( ! _via_attributes[attr_type][attr_id].hasOwnProperty('options') ) {
        _via_attributes[attr_type][attr_id].options = {};
        _via_attributes[attr_type][attr_id].default_options = {};
      }
      if ( _via_attributes[attr_type][attr_id].hasOwnProperty('default_value') ) {
        delete _via_attributes[attr_type][attr_id].default_value;
      }

      // 1. gather all the attribute values in existing metadata
      var existing_attr_values = attribute_get_unique_values(attr_type, attr_id);

      // 2. for checkbox, radio, dropdown: create options based on existing options and existing values
      for(var option_id in _via_attributes[attr_type][attr_id]['options']) {
        if( !existing_attr_values.includes(option_id) ) {
          _via_attributes[attr_type][attr_id]['options'][option_id] = option_id;
        }
      }

      // update existing metadata to reflect changes in attribute type
      // ensure that attribute has only one value
      for(var img_id in _via_img_metadata ) {
        for(var rindex in _via_img_metadata[img_id]['regions']) {
          if(_via_img_metadata[img_id]['regions'][rindex]['region_attributes'].hasOwnProperty(attr_id)) {
            if(old_attr_type === VIA_ATTRIBUTE_TYPE.CHECKBOX &&
               (new_attr_type === VIA_ATTRIBUTE_TYPE.RADIO ||
                new_attr_type === VIA_ATTRIBUTE_TYPE.DROPDOWN) ) {
              // add only if checkbox has only single option selected
              var sel_option_count = 0;
              var sel_option_id;
              for(var option_id in _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id]) {
                if(_via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id][option_id]) {
                  sel_option_count = sel_option_count + 1;
                  sel_option_id = option_id;
                }
              }
              if(sel_option_count === 1) {
                _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id] = sel_option_id;
              } else {
                // delete as multiple options cannot be represented as radio or dropdown
                delete _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id];
              }
            }
            if( (old_attr_type === VIA_ATTRIBUTE_TYPE.RADIO ||
                 old_attr_type === VIA_ATTRIBUTE_TYPE.DROPDOWN) &&
                new_attr_type === VIA_ATTRIBUTE_TYPE.CHECKBOX) {
              var old_option_id = _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id];
              _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id] = {};
              _via_img_metadata[img_id]['regions'][rindex]['region_attributes'][attr_id][old_option_id] = true;
            }
          }
        }
      }
    }
    show_attribute_properties();
    show_attribute_options();
    annotation_editor_update_content();
    break;
  }
}

function attribute_get_unique_values(attr_type, attr_id) {
  var values = [];
  switch ( attr_type ) {
  case 'file':
    var img_id, attr_val;
    for ( img_id in _via_img_metadata ) {
      if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty(attr_id) ) {
        attr_val = _via_img_metadata[img_id].file_attributes[attr_id];
        if ( ! values.includes(attr_val) ) {
          values.push(attr_val);
        }
      }
    }
    break;
  case 'region':
    var img_id, attr_val, i;
    for ( img_id in _via_img_metadata ) {
      for ( i = 0; i < _via_img_metadata[img_id].regions.length; ++i ) {
        if ( _via_img_metadata[img_id].regions[i].region_attributes.hasOwnProperty(attr_id) ) {
          attr_val = _via_img_metadata[img_id].regions[i].region_attributes[attr_id];
          if( typeof(attr_val) === 'object' ) {
            for(var option_id in _via_img_metadata[img_id].regions[i].region_attributes[attr_id]) {
              if ( ! values.includes(option_id) ) {
                values.push(option_id);
              }
            }
          } else {
            if ( ! values.includes(attr_val) ) {
              values.push(attr_val);
            }
          }
        }
      }
    }
    break;
  default:
    break;
  }
  return values;
}

function attribute_property_on_option_update(p) {
  var attr_id = get_current_attribute_id();
  if ( p.id.startsWith('_via_attribute_option_id_') ) {
    var old_key = p.id.substr( '_via_attribute_option_id_'.length );
    var new_key = p.value;
    if ( old_key !== new_key ) {
      var option_id_test = attribute_property_option_id_is_valid(attr_id, new_key);
      if ( option_id_test.is_valid ) {
        update_attribute_option_id_with_confirm(_via_attribute_being_updated,
                                                attr_id,
                                                old_key,
                                                new_key);
      } else {
        p.value = old_key; // restore old value
        show_message( option_id_test.message );
        show_attribute_properties();
      }
      return;
    }
  }

  if ( p.id.startsWith('_via_attribute_option_description_') ) {
    var key = p.id.substr( '_via_attribute_option_description_'.length );
    var old_value = _via_attributes[_via_attribute_being_updated][attr_id].options[key];
    var new_value = p.value;
    if ( new_value !== old_value ) {
      _via_attributes[_via_attribute_being_updated][attr_id].options[key] = new_value;
      show_attribute_properties();
      annotation_editor_update_content();
    }
  }

  if ( p.id.startsWith('_via_attribute_option_default_') ) {
    var new_default_option_id = p.id.substr( '_via_attribute_option_default_'.length );
    var old_default_option_id_list = Object.keys(_via_attributes[_via_attribute_being_updated][attr_id].default_options);

    if ( old_default_option_id_list.length === 0 ) {
      // default set for the first time
      _via_attributes[_via_attribute_being_updated][attr_id].default_options[new_default_option_id] = p.checked;
    } else {
      switch ( _via_attributes[_via_attribute_being_updated][attr_id].type ) {
      case 'image':    // fallback
      case 'dropdown': // fallback
      case 'radio':    // fallback
        // to ensure that only one radio button is selected at a time
        _via_attributes[_via_attribute_being_updated][attr_id].default_options = {};
        _via_attributes[_via_attribute_being_updated][attr_id].default_options[new_default_option_id] = p.checked;
        break;
      case 'checkbox':
        _via_attributes[_via_attribute_being_updated][attr_id].default_options[new_default_option_id] = p.checked;
        break;
      }
    }
    // default option updated
    attribute_property_on_option_default_update(_via_attribute_being_updated,
                                                attr_id,
                                                new_default_option_id).then( function() {
                                                  show_attribute_properties();
                                                  annotation_editor_update_content();
                                                });
  }
}

function attribute_property_on_option_default_update(attribute_being_updated, attr_id, new_default_option_id) {
  return new Promise( function(ok_callback, err_callback) {
    // set all metadata to new_value if:
    // - metadata[attr_id] is missing
    // - metadata[attr_id] is set to option_old_value
    var img_id, attr_value, n, i;
    var attr_type = _via_attributes[attribute_being_updated][attr_id].type;
    switch( attribute_being_updated ) {
    case 'file':
      for ( img_id in _via_img_metadata ) {
        if ( ! _via_img_metadata[img_id].file_attributes.hasOwnProperty(attr_id) ) {
          _via_img_metadata[img_id].file_attributes[attr_id] = new_default_option_id;
        }
      }
      break;
    case 'region':
      for ( img_id in _via_img_metadata ) {
        n = _via_img_metadata[img_id].regions.length;
        for ( i = 0; i < n; ++i ) {
          if ( ! _via_img_metadata[img_id].regions[i].region_attributes.hasOwnProperty(attr_id) ) {
            _via_img_metadata[img_id].regions[i].region_attributes[attr_id] = new_default_option_id;
          }
        }
      }
      break;
    }
    ok_callback();
  });
}

function attribute_property_on_option_add(p) {
  if ( p.value === '' || p.value === null ) {
    return;
  }

  if ( p.id === '_via_attribute_new_option_id' ) {
    var attr_id = get_current_attribute_id();
    var option_id = p.value;
    var option_id_test = attribute_property_option_id_is_valid(attr_id, option_id);
    if ( option_id_test.is_valid ) {
      _via_attributes[_via_attribute_being_updated][attr_id].options[option_id] = '';
      show_attribute_options();
      annotation_editor_update_content();
    } else {
      show_message( option_id_test.message );
      attribute_property_reset_new_entry_inputs();
    }
  }
}

function attribute_property_reset_new_entry_inputs() {
  var container = document.getElementById('attribute_options');
  var p = container.lastChild;
  if ( p.childNodes[0] ) {
    p.childNodes[0].value = '';
  }
  if ( p.childNodes[1] ) {
    p.childNodes[1].value = '';
  }
}

function attribute_property_show_new_entry_inputs(attr_id, attribute_type) {
  var n0 = document.createElement('div');
  n0.classList.add('property');
  var n1a = document.createElement('span');
  var n1b = document.createElement('input');
  n1b.setAttribute('onchange', 'attribute_property_on_option_add(this)');
  n1b.setAttribute('placeholder', 'Add new id');
  n1b.setAttribute('value', '');
  n1b.setAttribute('id', '_via_attribute_new_option_id');
  n1a.appendChild(n1b);

  var n2a = document.createElement('span');
  var n2b = document.createElement('input');
  n2b.setAttribute('onchange', 'attribute_property_on_option_add(this)');
  n2b.setAttribute('placeholder', 'Optional description');
  n2b.setAttribute('value', '');
  n2b.setAttribute('id', '_via_attribute_new_option_description');
  n2a.appendChild(n2b);

  var n3a = document.createElement('span');
  var n3b = document.createElement('input');
  n3b.setAttribute('type', attribute_type);
  if ( attribute_type === 'radio' ) {
    n3b.setAttribute('name', attr_id);
  }
  n3b.setAttribute('onchange', 'attribute_property_on_option_add(this)');
  n3b.setAttribute('id', '_via_attribute_new_option_default');
  n3a.appendChild(n3b);

  n0.appendChild(n1a);
  n0.appendChild(n2a);
  n0.appendChild(n3a);

  var container = document.getElementById('attribute_options');
  container.appendChild(n0);
}

function attribute_property_option_id_is_valid(attr_id, new_option_id) {
  var option_id;
  for ( option_id in _via_attributes[_via_attribute_being_updated][attr_id].options ) {
    if ( option_id === new_option_id ) {
      return { 'is_valid':false, 'message':'Option id [' + attr_id + '] already exists' };
    }
  }

  if ( new_option_id.includes('__') ) { // reserved separator for attribute-id, row-id, option-id
    return {'is_valid':false, 'message':'Option id cannot contain two consecutive underscores'};
  }

  return {'is_valid':true};
}

function attribute_property_id_exists(name) {
  var attr_name;
  for ( attr_name in _via_attributes[_via_attribute_being_updated] ) {
    if ( attr_name === name ) {
      return true;
    }
  }
  return false;
}

function delete_existing_attribute_with_confirm() {
  var attr_id = document.getElementById('user_input_attribute_id').value;
  if ( attr_id === '' ) {
    show_message('Enter the name of attribute that you wish to delete');
    return;
  }
  if ( attribute_property_id_exists(attr_id) ) {
    var config = {'title':'Delete ' + _via_attribute_being_updated + ' attribute [' + attr_id + ']',
                  'warning': 'Warning: Deleting an attribute will lead to the attribute being deleted in all the annotations. Please click OK only if you are sure.'};
    var input = { 'attr_type':{'type':'text', 'name':'Attribute Type', 'value':_via_attribute_being_updated, 'disabled':true},
                  'attr_id':{'type':'text', 'name':'Attribute Id', 'value':attr_id, 'disabled':true}
                };
    invoke_with_user_inputs(delete_existing_attribute_confirmed, input, config);
  } else {
    show_message('Attribute [' + attr_id + '] does not exist!');
    return;
  }
}

function delete_existing_attribute_confirmed(input) {
  var attr_type = input.attr_type.value;
  var attr_id   = input.attr_id.value;
  delete_existing_attribute(attr_type, attr_id);
  document.getElementById('user_input_attribute_id').value = '';
  show_message('Deleted ' + attr_type + ' attribute [' + attr_id + ']');
  user_input_default_cancel_handler();
}

function delete_existing_attribute(attribute_type, attr_id) {
  if ( _via_attributes[attribute_type].hasOwnProperty( attr_id ) ) {
    var attr_id_list = Object.keys(_via_attributes[attribute_type]);
    if ( attr_id_list.length === 1 ) {
      _via_current_attribute_id = '';
    } else {
      var current_index = attr_id_list.indexOf(attr_id);
      var next_index = current_index + 1;
      if ( next_index === attr_id_list.length ) {
        next_index = current_index - 1;
      }
      _via_current_attribute_id = attr_id_list[next_index];
    }
    delete _via_attributes[attribute_type][attr_id];
    delete_region_attribute_in_all_metadata(attr_id);
    update_attributes_update_panel();
    annotation_editor_update_content();
  }
}

function add_new_attribute_from_user_input() {
  var attr_id = document.getElementById('user_input_attribute_id').value;
  if ( attr_id === '' ) {
    show_message('Enter the name of attribute that you wish to delete');
    return;
  }

  if ( attribute_property_id_exists(attr_id) ) {
    show_message('The ' + _via_attribute_being_updated + ' attribute [' + attr_id + '] already exists.');
  } else {
    _via_current_attribute_id = attr_id;
    add_new_attribute(attr_id);
    update_attributes_update_panel();
    annotation_editor_update_content();
    show_message('Added ' + _via_attribute_being_updated + ' attribute [' + attr_id + '].');
  }
}

function add_new_attribute(attribute_id) {
  _via_attributes[_via_attribute_being_updated][attribute_id] = {};
  _via_attributes[_via_attribute_being_updated][attribute_id].type = 'text';
  _via_attributes[_via_attribute_being_updated][attribute_id].description = '';
  _via_attributes[_via_attribute_being_updated][attribute_id].default_value = '';
}

function update_current_attribute_id(p) {
  _via_current_attribute_id = p.options[p.selectedIndex].value;
  update_attribute_properties_panel();
}

function get_current_attribute_id() {
  return document.getElementById('attributes_name_list').value;
}

function update_attribute_option_id_with_confirm(attr_type, attr_id, option_id, new_option_id) {
  var is_delete = false;
  var config;
  if ( new_option_id === '' || typeof(new_option_id) === 'undefined' ) {
    // an empty new_option_id indicates deletion of option_id
    config = {'title':'Delete an option for ' + attr_type + ' attribute'};
    is_delete = true;
  } else {
    config = {'title':'Rename an option for ' + attr_type + ' attribute'};
  }

  var input = { 'attr_type':{'type':'text', 'name':'Attribute Type', 'value':attr_type, 'disabled':true},
                'attr_id':{'type':'text', 'name':'Attribute Id', 'value':attr_id, 'disabled':true}
              };

  if ( is_delete ) {
    input['option_id'] = {'type':'text', 'name':'Attribute Option', 'value':option_id, 'disabled':true};
  } else {
    input['option_id']     = {'type':'text', 'name':'Attribute Option (old)', 'value':option_id, 'disabled':true},
    input['new_option_id'] = {'type':'text', 'name':'Attribute Option (new)', 'value':new_option_id, 'disabled':true};
  }

  invoke_with_user_inputs(update_attribute_option_id_confirmed, input, config, update_attribute_option_id_cancel);
}

function update_attribute_option_id_cancel(input) {
  update_attribute_properties_panel();
}

function update_attribute_option_id_confirmed(input) {
  var attr_type = input.attr_type.value;
  var attr_id = input.attr_id.value;
  var option_id = input.option_id.value;
  var is_delete;
  var new_option_id;
  if ( typeof(input.new_option_id) === 'undefined' || input.new_option_id === '' ) {
    is_delete = true;
    new_option_id = '';
  } else {
    is_delete = false;
    new_option_id = input.new_option_id.value;
  }

  update_attribute_option(is_delete, attr_type, attr_id, option_id, new_option_id);

  if ( is_delete ) {
    show_message('Deleted option [' + option_id + '] for ' + attr_type + ' attribute [' + attr_id + '].');
  } else {
    show_message('Renamed option [' + option_id + '] to [' + new_option_id + '] for ' + attr_type + ' attribute [' + attr_id + '].');
  }
  update_attribute_properties_panel();
  annotation_editor_update_content();
  user_input_default_cancel_handler();
}

function update_attribute_option(is_delete, attr_type, attr_id, option_id, new_option_id) {
  switch ( attr_type ) {
  case 'region':
    update_region_attribute_option_in_all_metadata(is_delete, attr_id, option_id, new_option_id);
    if ( ! is_delete ) {
      Object.defineProperty(_via_attributes[attr_type][attr_id].options,
                            new_option_id,
                            Object.getOwnPropertyDescriptor(_via_attributes[_via_attribute_being_updated][attr_id].options, option_id));
    }
    delete _via_attributes['region'][attr_id].options[option_id];

    break;
  case 'file':
    update_file_attribute_option_in_all_metadata(attr_id, option_id);
    if ( ! is_delete ) {
      Object.defineProperty(_via_attributes[attr_type][attr_id].options,
                            new_option_id,
                            Object.getOwnPropertyDescriptor(_via_attributes[_via_attribute_being_updated][attr_id].options, option_id));
    }

    delete _via_attributes['file'][attr_id].options[option_id];
    break;
  }
}

function update_file_attribute_option_in_all_metadata(is_delete, attr_id, option_id, new_option_id) {
  var image_id;
  for ( image_id in _via_img_metadata ) {
    if ( _via_img_metadata[image_id].file_attributes.hasOwnProperty(attr_id) ) {
      if ( _via_img_metadata[image_id].file_attributes[attr_id].hasOwnProperty(option_id) ) {
        Object.defineProperty(_via_img_metadata[image_id].file_attributes[attr_id],
                              new_option_id,
                              Object.getOwnPropertyDescriptor(_via_img_metadata[image_id].file_attributes[attr_id], option_id));
        delete _via_img_metadata[image_id].file_attributes[attr_id][option_id];
      }
    }
  }
}

function update_region_attribute_option_in_all_metadata(is_delete, attr_id, option_id, new_option_id) {
  var image_id;
  for ( image_id in _via_img_metadata ) {
    for (var i = 0; i < _via_img_metadata[image_id].regions.length; ++i ) {
      if ( _via_img_metadata[image_id].regions[i].region_attributes.hasOwnProperty(attr_id) ) {
        if ( _via_img_metadata[image_id].regions[i].region_attributes[attr_id].hasOwnProperty(option_id) ) {
          Object.defineProperty(_via_img_metadata[image_id].regions[i].region_attributes[attr_id],
                                new_option_id,
                                Object.getOwnPropertyDescriptor(_via_img_metadata[image_id].regions[i].region_attributes[attr_id], option_id));
          delete _via_img_metadata[image_id].regions[i].region_attributes[attr_id][option_id];
        }
      }
    }
  }
}

function delete_region_attribute_in_all_metadata(attr_id) {
  var image_id;
  for ( image_id in _via_img_metadata ) {
    for (var i = 0; i < _via_img_metadata[image_id].regions.length; ++i ) {
      if ( _via_img_metadata[image_id].regions[i].region_attributes.hasOwnProperty(attr_id)) {
        delete _via_img_metadata[image_id].regions[i].region_attributes[attr_id];
      }
    }
  }
}

function delete_file_attribute_option_from_all_metadata(attr_id, option_id) {
  var image_id;
  for ( image_id in _via_img_metadata ) {
    if ( _via_img_metadata.hasOwnProperty(image_id) ) {
      delete_file_attribute_option_from_metadata(image_id, attr_id, option_id);
    }
  }
}

function delete_file_attribute_option_from_metadata(image_id, attr_id, option_id) {
  var i;
  if ( _via_img_metadata[image_id].file_attributes.hasOwnProperty(attr_id) ) {
    if ( _via_img_metadata[image_id].file_attributes[attr_id].hasOwnProperty(option_id) ) {
      delete _via_img_metadata[image_id].file_attributes[attr_id][option_id];
    }
  }
}

function delete_file_attribute_from_all_metadata(image_id, attr_id) {
  var image_id;
  for ( image_id in _via_img_metadata ) {
    if ( _via_img_metadata.hasOwnProperty(image_id) ) {
      if ( _via_img_metadata[image_id].file_attributes.hasOwnProperty(attr_id) ) {
        delete _via_img_metadata[image_id].file_attributes[attr_id];
      }
    }
  }
}

//
// invoke a method after receiving inputs from user
//
function invoke_with_user_inputs(ok_handler, input, config, cancel_handler) {
  setup_user_input_panel(ok_handler, input, config, cancel_handler);
  show_user_input_panel();
}

function setup_user_input_panel(ok_handler, input, config, cancel_handler) {
  // create html page with OK and CANCEL button
  // when OK is clicked
  //  - setup input with all the user entered values
  //  - invoke handler with input
  // when CANCEL is clicked
  //  - invoke user_input_cancel()
  _via_user_input_ok_handler = ok_handler;
  _via_user_input_cancel_handler = cancel_handler;
  _via_user_input_data = input;

  var p = document.getElementById('user_input_panel');
  var c = document.createElement('div');
  c.setAttribute('class', 'content');
  var html = [];
  html.push('<p class="title">' + config.title + '</p>');

  html.push('<div class="user_inputs">');
  var key;
  for ( key in _via_user_input_data ) {
    html.push('<div class="row">');
    html.push('<span class="cell">' + _via_user_input_data[key].name + '</span>');
    var disabled_html = '';
    if ( _via_user_input_data[key].disabled ) {
      disabled_html = 'disabled="disabled"';
    }
    var value_html = '';
    if ( _via_user_input_data[key].value ) {
      value_html = 'value="' + _via_user_input_data[key].value + '"';
    }

    switch(_via_user_input_data[key].type) {
    case 'checkbox':
      if ( _via_user_input_data[key].checked ) {
        value_html = 'checked="checked"';
      } else {
        value_html = '';
      }
      html.push('<span class="cell">' +
                '<input class="_via_user_input_variable" ' +
                value_html + ' ' +
                disabled_html + ' ' +
                'type="checkbox" id="' + key + '"></span>');
      break;
    case 'text':
      var size = '50';
      if ( _via_user_input_data[key].size ) {
        size = _via_user_input_data[key].size;
      }
      var placeholder = '';
      if ( _via_user_input_data[key].placeholder ) {
        placeholder = _via_user_input_data[key].placeholder;
      }
      html.push('<span class="cell">' +
                '<input class="_via_user_input_variable" ' +
                value_html + ' ' +
                disabled_html + ' ' +
                'size="' + size + '" ' +
                'placeholder="' + placeholder + '" ' +
                'type="text" id="' + key + '"></span>');

      break;
    case 'textarea':
      var rows = '5';
      var cols = '50'
      if ( _via_user_input_data[key].rows ) {
        rows = _via_user_input_data[key].rows;
      }
      if ( _via_user_input_data[key].cols ) {
        cols = _via_user_input_data[key].cols;
      }
      var placeholder = '';
      if ( _via_user_input_data[key].placeholder ) {
        placeholder = _via_user_input_data[key].placeholder;
      }
      html.push('<span class="cell">' +
                '<textarea class="_via_user_input_variable" ' +
                disabled_html + ' ' +
                'rows="' + rows + '" ' +
                'cols="' + cols + '" ' +
                'placeholder="' + placeholder + '" ' +
                'id="' + key + '">' + value_html + '</textarea></span>');

      break;

    }
    html.push('</div>'); // end of row
  }
  html.push('</div>'); // end of user_input div
  // optional warning before confirmation
  if (config.hasOwnProperty("warning") ) {
    html.push('<div class="warning">' + config.warning + '</div>');
  }
  html.push('<div class="user_confirm">' +
            '<span class="ok">' +
            '<button id="user_input_ok_button" onclick="user_input_parse_and_invoke_handler()">&nbsp;OK&nbsp;</button></span>' +
            '<span class="cancel">' +
            '<button id="user_input_cancel_button" onclick="user_input_cancel_handler()">CANCEL</button></span></div>');
  c.innerHTML = html.join('');
  p.innerHTML = '';
  p.appendChild(c);

}

function user_input_default_cancel_handler() {
  hide_user_input_panel();
  _via_user_input_data = {};
  _via_user_input_ok_handler = null;
  _via_user_input_cancel_handler = null;
}

function user_input_cancel_handler() {
  if ( _via_user_input_cancel_handler ) {
    _via_user_input_cancel_handler();
  }
  user_input_default_cancel_handler();
}

function user_input_parse_and_invoke_handler() {
  var elist = document.getElementsByClassName('_via_user_input_variable');
  var i;
  for ( i=0; i < elist.length; ++i ) {
    var eid = elist[i].id;
    if ( _via_user_input_data.hasOwnProperty(eid) ) {
      switch(_via_user_input_data[eid].type) {
      case 'checkbox':
        _via_user_input_data[eid].value = elist[i].checked;
        break;
      default:
        _via_user_input_data[eid].value = elist[i].value;
        break;
      }
    }
  }
  if ( typeof(_via_user_input_data.confirm) !== 'undefined' ) {
    if ( _via_user_input_data.confirm.value ) {
      _via_user_input_ok_handler(_via_user_input_data);
    } else {
      if ( _via_user_input_cancel_handler ) {
        _via_user_input_cancel_handler();
      }
    }
  } else {
    _via_user_input_ok_handler(_via_user_input_data);
  }
  user_input_default_cancel_handler();
}

function show_user_input_panel() {
  document.getElementById('user_input_panel').style.display = 'block';
}

function hide_user_input_panel() {
  document.getElementById('user_input_panel').style.display = 'none';
}

//
// annotations editor panel
//
function annotation_editor_show() {
  // remove existing annotation editor (if any)
  annotation_editor_remove();

  // create new container of annotation editor
  var ae = document.createElement('div');
  ae.setAttribute('id', 'annotation_editor');

  if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION ) {
    if ( _via_settings.ui.image.on_image_annotation_editor_placement === VIA_ANNOTATION_EDITOR_PLACEMENT.DISABLE ) {
      return;
    }

    // only display on-image annotation editor if
    // - region attribute are defined
    // - region is selected
    if ( _via_is_region_selected &&
         Object.keys(_via_attributes['region']).length &&
         _via_attributes['region'].constructor === Object ) {
      ae.classList.add('force_small_font');
      ae.classList.add('display_area_content'); // to enable automatic hiding of this content
      // add annotation editor to image_panel
      if ( _via_settings.ui.image.on_image_annotation_editor_placement === VIA_ANNOTATION_EDITOR_PLACEMENT.NEAR_REGION ) {
        var html_position = annotation_editor_get_placement(_via_user_sel_region_id);
        ae.style.top = html_position.top;
        ae.style.left = html_position.left;
      }
      _via_display_area.appendChild(ae);
      annotation_editor_update_content();
      update_vertical_space();
    }
  } else {
    // show annotation editor in a separate panel at the bottom
    _via_annotaion_editor_panel.appendChild(ae);
    annotation_editor_update_content();
    update_vertical_space();

    if ( _via_is_region_selected ) {
      // highlight entry for region_id in annotation editor panel
      annotation_editor_scroll_to_row(_via_user_sel_region_id);
      annotation_editor_highlight_row(_via_user_sel_region_id);
    }
  }
}

function annotation_editor_hide() {
  if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION ) {
    // remove existing annotation editor (if any)
    annotation_editor_remove();
  } else {
    annotation_editor_clear_row_highlight();
  }
}

function annotation_editor_toggle_on_image_editor() {
  if ( _via_settings.ui.image.on_image_annotation_editor_placement === VIA_ANNOTATION_EDITOR_PLACEMENT.DISABLE ) {
    _via_annotation_editor_mode = VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION;
    _via_settings.ui.image.on_image_annotation_editor_placement = VIA_ANNOTATION_EDITOR_PLACEMENT.NEAR_REGION;
    annotation_editor_show();
    show_message('Enabled on image annotation editor');
  } else {
    _via_settings.ui.image.on_image_annotation_editor_placement = VIA_ANNOTATION_EDITOR_PLACEMENT.DISABLE;
    _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.ALL_REGIONS;
    annotation_editor_hide();
    show_message('Disabled on image annotation editor');
  }
}

function annotation_editor_update_content() {
  return new Promise( function(ok_callback, err_callback) {
    var ae = document.getElementById('annotation_editor');
    if (ae ) {
      ae.innerHTML = '';
      annotation_editor_update_header_html();
      annotation_editor_update_metadata_html();
    }
    ok_callback();
  });
}

function annotation_editor_get_placement(region_id) {
  var html_position = {};
  var r = _via_canvas_regions[region_id]['shape_attributes'];
  var shape = r['name'];
  switch( shape ) {
  case 'rect':
    html_position.top = r['y'] + r['height'];
    html_position.left = r['x'] + r['width'];
    break;
  case 'circle':
    html_position.top = r['cy'] + r['r'];
    html_position.left = r['cx'];
    break;
  case 'ellipse':
    html_position.top = r['cy'] + r['ry'] * Math.cos(r['theta']);
    html_position.left = r['cx'] - r['ry'] * Math.sin(r['theta']);
    break;
  case 'polygon':
  case 'polyline':
    var most_left =
      Object.keys(r['all_points_x']).reduce(function(a, b){
        return r['all_points_x'][a] > r['all_points_x'][b] ? a : b });
    html_position.top  = Math.max( r['all_points_y'][most_left] );
    html_position.left = Math.max( r['all_points_x'][most_left] );
    break;
  case 'point':
    html_position.top = r['cy'];
    html_position.left = r['cx'];
    break;
  }
  html_position.top  = html_position.top + _via_img_panel.offsetTop + _via_reg_canvas_margin + VIA_REGION_EDGE_TOL + 'px';
  html_position.left = html_position.left + _via_img_panel.offsetLeft + _via_reg_canvas_margin + VIA_REGION_EDGE_TOL + 'px';
  return html_position;
}

function annotation_editor_remove() {
  var p = document.getElementById('annotation_editor');
  if ( p ) {
    p.remove();
  }
}

function is_annotation_editor_visible() {
  return document.getElementById('annotation_editor_panel').classList.contains('display_block');
}

function annotation_editor_toggle_all_regions_editor() {
  var p = document.getElementById('annotation_editor_panel');
  if ( p.classList.contains('display_block') ) {
    p.classList.remove('display_block');
    _via_annotation_editor_mode = VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION;
    update_vertical_space();
  } else {
    _via_annotation_editor_mode = VIA_ANNOTATION_EDITOR_MODE.ALL_REGIONS;
    p.classList.add('display_block');
    p.style.width = _via_settings.ui.annotation_editor_height + '%';
    p.style.fontSize = _via_settings.ui.annotation_editor_fontsize + 'rem';
    var topbar = document.getElementById('ui_top_panel');
    if ( topbar ) {
      var topH = topbar.offsetHeight;
      p.style.top = topH + 'px';
      p.style.height = 'calc(100% - ' + topH + 'px)';
    }
    annotation_editor_show();
  }
}

function annotation_editor_set_active_button() {
  var attribute_type;
  for ( attribute_type in _via_attributes ) {
    var bid = 'button_edit_' + attribute_type + '_metadata';
    document.getElementById(bid).classList.remove('active');
  }
  var bid = 'button_edit_' + _via_metadata_being_updated + '_metadata';
  document.getElementById(bid).classList.add('active');
}

function edit_region_metadata_in_annotation_editor() {
  _via_metadata_being_updated = 'region';
  annotation_editor_set_active_button();
  annotation_editor_update_content();
}
function edit_file_metadata_in_annotation_editor() {
  _via_metadata_being_updated = 'file';
  annotation_editor_set_active_button();
  annotation_editor_update_content();
}

function annotation_editor_update_header_html() {
  var head = document.createElement('div');
  head.setAttribute('class', 'row');
  head.setAttribute('id', 'annotation_editor_header');

  if ( _via_metadata_being_updated === 'region' ) {
    var rid_col = document.createElement('span');
    rid_col.setAttribute('class', 'col');
    rid_col.innerHTML = '';
    head.appendChild(rid_col);

    // header for delete button column
    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE ) {
      var del_col = document.createElement('span');
      del_col.setAttribute('class', 'col');
      del_col.innerHTML = '';
      head.appendChild(del_col);
    }
  }

  if ( _via_metadata_being_updated === 'file' ) {
    var rid_col = document.createElement('span');
    rid_col.setAttribute('class', 'col header');
    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
      rid_col.innerHTML = 'group';
    } else {
      rid_col.innerHTML = 'filename';
    }
    head.appendChild(rid_col);
  }

  var attr_id;
  for ( attr_id in _via_attributes[_via_metadata_being_updated] ) {
    var col = document.createElement('span');
    col.setAttribute('class', 'col header');
    col.innerHTML = attr_id;
    head.appendChild(col);
  }

  var ae = document.getElementById('annotation_editor');
  if ( ae.childNodes.length === 0 ) {
    ae.appendChild(head);
  } else {
    if ( ae.firstChild.id === 'annotation_editor_header') {
      ae.replaceChild(head, ae.firstChild);
    } else {
      // header node is absent
      ae.insertBefore(head, ae.firstChild);
    }
  }
}

function annotation_editor_update_metadata_html() {
  if ( ! _via_img_count ) {
    return;
  }

  var ae = document.getElementById('annotation_editor');
  switch ( _via_metadata_being_updated ) {
  case 'region':
    var rindex;
    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
      ae.appendChild( annotation_editor_get_metadata_row_html(0) );
    } else {
      if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE ) {
        if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION ) {
          ae.appendChild( annotation_editor_get_metadata_row_html(_via_user_sel_region_id) );
        } else {
          for ( rindex = 0; rindex < _via_img_metadata[_via_image_id].regions.length; ++rindex ) {
            ae.appendChild( annotation_editor_get_metadata_row_html(rindex) );
          }
        }
      }
    }
    break;

  case 'file':
    ae.appendChild( annotation_editor_get_metadata_row_html(0) );
    break;
  }
}

function annotation_editor_update_row(row_id) {
  var ae = document.getElementById('annotation_editor');

  var new_row = annotation_editor_get_metadata_row_html(row_id);
  var old_row = document.getElementById(new_row.getAttribute('id'));
  ae.replaceChild(new_row, old_row);
}

function annotation_editor_add_row(row_id) {
  if ( is_annotation_editor_visible() ) {
    var ae = document.getElementById('annotation_editor');
    var new_row = annotation_editor_get_metadata_row_html(row_id);
    var penultimate_row_id = parseInt(row_id) - 1;
    if ( penultimate_row_id >= 0 ) {
      var penultimate_row_html_id = 'ae_' + _via_metadata_being_updated + '_' + penultimate_row_id;
      var penultimate_row = document.getElementById(penultimate_row_html_id);
      ae.insertBefore(new_row, penultimate_row.nextSibling);
    } else {
      ae.appendChild(new_row);
    }
  }
}

function annotation_editor_select_region(region_id) {
  if ( _via_metadata_being_updated !== 'region' ) {
    return;
  }
  select_only_region(region_id);
  annotation_editor_clear_row_highlight();
  annotation_editor_highlight_row(region_id);
  _via_redraw_reg_canvas();
  _via_reg_canvas.focus();
}

function annotation_editor_delete_region(region_id) {
  select_only_region(region_id);
  del_sel_regions();
}

// Compute convex hull (Jarvis march) and optionally reduce to max_pts points
function _poly_convex_hull(xs, ys) {
  var n = xs.length;
  if (n < 3) return { x: xs.slice(), y: ys.slice() };

  // Find leftmost point
  var start = 0;
  for (var i = 1; i < n; i++) {
    if (xs[i] < xs[start] || (xs[i] === xs[start] && ys[i] < ys[start])) start = i;
  }

  var hull_x = [], hull_y = [];
  var current = start;
  do {
    hull_x.push(xs[current]);
    hull_y.push(ys[current]);
    var next = (current + 1) % n;
    for (var j = 0; j < n; j++) {
      // Cross product to find most counter-clockwise point
      var cross = (xs[j] - xs[current]) * (ys[next] - ys[current]) -
                  (ys[j] - ys[current]) * (xs[next] - xs[current]);
      if (cross < 0) next = j;
    }
    current = next;
  } while (current !== start && hull_x.length <= n);

  return { x: hull_x, y: hull_y };
}

// Reduce polygon to at most max_pts by removing points with smallest triangle area
function _poly_reduce(hull_x, hull_y, max_pts) {
  var px = hull_x.slice(), py = hull_y.slice();
  while (px.length > max_pts) {
    var min_area = Infinity, min_i = 0;
    for (var i = 0; i < px.length; i++) {
      var prev = (i - 1 + px.length) % px.length;
      var next = (i + 1) % px.length;
      var area = Math.abs(
        (px[prev] - px[next]) * (py[i] - py[prev]) -
        (px[prev] - px[i])   * (py[next] - py[prev])
      );
      if (area < min_area) { min_area = area; min_i = i; }
    }
    px.splice(min_i, 1);
    py.splice(min_i, 1);
  }
  return { x: px, y: py };
}

function annotation_editor_simplify_poly(region_id) {
  var img_id = _via_image_id;
  var region = _via_img_metadata[img_id].regions[region_id];
  if (!region || region.shape_attributes['name'] !== 'polygon') {
    alert('Simplify only works on polygon regions.');
    return;
  }

  var xs = region.shape_attributes['all_points_x'].slice();
  var ys = region.shape_attributes['all_points_y'].slice();

  // Step 1: compute convex hull (removes holes / concavities)
  var hull = _poly_convex_hull(xs, ys);

  // Step 2: reduce to ≤12 points if needed
  var MAX_PTS = 12;
  var result = hull.x.length > MAX_PTS
    ? _poly_reduce(hull.x, hull.y, MAX_PTS)
    : hull;

  // Update the region
  region.shape_attributes['all_points_x'] = result.x;
  region.shape_attributes['all_points_y'] = result.y;

  // Sync canvas regions and redraw
  _via_load_canvas_regions();
  _via_redraw_reg_canvas();
  annotation_editor_update_content();
}

function annotation_editor_get_metadata_row_html(row_id) {
  var row = document.createElement('div');
  row.setAttribute('class', 'row');
  row.setAttribute('id', 'ae_' + _via_metadata_being_updated + '_' + row_id);

  if ( _via_metadata_being_updated === 'region' ) {
    var rid = document.createElement('span');

    switch(_via_display_area_content_name) {
    case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID:
      rid.setAttribute('class', 'col');
      rid.innerHTML = 'Grouped regions in ' + _via_image_grid_selected_img_index_list.length + ' files';
      break;
    case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE:
      rid.setAttribute('class', 'col id');
      rid.style.cursor = 'pointer';
      rid.title = 'Click to select this region';
      rid.innerHTML = (row_id + 1);
      (function(rid_elem, rid_val) {
        rid_elem.addEventListener('click', function() {
          annotation_editor_select_region(rid_val);
        });
      })(rid, row_id);
      break;
    }
    row.appendChild(rid);

    // bin (delete) button
    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE ) {
      // simplify poly button (only for polygon regions)
      var region_shape = _via_img_metadata[_via_image_id].regions[row_id]
                         && _via_img_metadata[_via_image_id].regions[row_id].shape_attributes['name'];
      if ( region_shape === 'polygon' ) {
        var simp_btn = document.createElement('span');
        simp_btn.setAttribute('class', 'col');
        simp_btn.style.cursor = 'pointer';
        simp_btn.style.color = '#0066cc';
        simp_btn.style.fontWeight = 'bold';
        simp_btn.style.fontSize = '0.85em';
        simp_btn.title = 'Simplify polygon to convex hull (\u226412 points)';
        simp_btn.innerHTML = '🔨';
        (function(btn, rid_val) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            annotation_editor_simplify_poly(rid_val);
          });
        })(simp_btn, row_id);
        row.appendChild(simp_btn);
      }

      var del_btn = document.createElement('span');
      del_btn.setAttribute('class', 'col');
      del_btn.style.cursor = 'pointer';
      del_btn.style.color = '#cc0000';
      del_btn.style.fontWeight = 'bold';
      del_btn.title = 'Delete this region';
      del_btn.innerHTML = '&#x1F5D1;';
      (function(btn, rid_val) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          annotation_editor_delete_region(rid_val);
        });
      })(del_btn, row_id);
      row.appendChild(del_btn);
    }
  }

  if ( _via_metadata_being_updated === 'file' ) {
    var rid = document.createElement('span');
    rid.setAttribute('class', 'col');
    switch(_via_display_area_content_name) {
    case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID:
      rid.innerHTML = 'Group of ' + _via_image_grid_selected_img_index_list.length + ' files';
      break;
    case VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE:
      rid.innerHTML = _via_image_filename_list[_via_image_index];
      break;
    }

    row.appendChild(rid);
  }

  var attr_id;
  for ( attr_id in _via_attributes[_via_metadata_being_updated] ) {
    var col = document.createElement('span');
    col.setAttribute('class', 'col');

    var attr_type    = _via_attributes[_via_metadata_being_updated][attr_id].type;
    var attr_desc    = _via_attributes[_via_metadata_being_updated][attr_id].desc;
    if ( typeof(attr_desc) === 'undefined' ) {
      attr_desc = '';
    }
    var attr_html_id = attr_id + '__' + row_id;

    var attr_value = '';
    var attr_placeholder = '';
    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE ) {
      switch(_via_metadata_being_updated) {
      case 'region':
        if ( _via_img_metadata[_via_image_id].regions[row_id].region_attributes.hasOwnProperty(attr_id) ) {
          attr_value = _via_img_metadata[_via_image_id].regions[row_id].region_attributes[attr_id];
        } else {
          attr_placeholder = 'not defined yet!';
        }
      case 'file':
        if ( _via_img_metadata[_via_image_id].file_attributes.hasOwnProperty(attr_id) ) {
          attr_value = _via_img_metadata[_via_image_id].file_attributes[attr_id];
        } else {
          attr_placeholder = 'not defined yet!';
        }
      }
    }

    if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
      var attr_metadata_stat;
      switch(_via_metadata_being_updated) {
      case 'region':
        attr_metadata_stat = _via_get_region_metadata_stat(_via_image_grid_selected_img_index_list, attr_id);
        break;
      case 'file':
        attr_metadata_stat = _via_get_file_metadata_stat(_via_image_grid_selected_img_index_list, attr_id);
        break;
      }

      switch ( attr_type ) {
      case 'text':
        if ( attr_metadata_stat.hasOwnProperty(attr_id) ) {
          var attr_value_set = Object.keys(attr_metadata_stat[attr_id]);
          if ( attr_value_set.includes('undefined') ) {
            attr_value = '';
            attr_placeholder = 'includes ' + attr_metadata_stat[attr_id]['undefined'] + ' undefined values';
          } else {
            switch( attr_value_set.length ) {
            case 0:
              attr_value = '';
              attr_placeholder = 'not applicable';
              break;
            case 1:
              attr_value = attr_value_set[0];
              attr_placeholder = '';
              break;
            default:
              attr_value = '';
              attr_placeholder = attr_value_set.length + ' different values: ' + JSON.stringify(attr_value_set).replace(/"/g,'\'');
            }
          }
        } else {
          attr_value = '';
          attr_placeholder = 'not defined yet!';
        }
        break;

      case 'radio':    // fallback
      case 'dropdown': // fallback
      case 'image':    // fallback
        if ( attr_metadata_stat.hasOwnProperty(attr_id) ) {
          var attr_value_set = Object.keys(attr_metadata_stat[attr_id]);
          if ( attr_value_set.length === 1 ) {
            attr_value = attr_value_set[0];
          } else {
            attr_value = '';
          }
        } else {
          attr_value = '';
        }
        break;

      case 'checkbox':
        attr_value = {};
        if ( attr_metadata_stat.hasOwnProperty(attr_id) ) {
          var attr_value_set = Object.keys(attr_metadata_stat[attr_id]);
          var same_count = true;
          var i, n;
          var attr_value_curr, attr_value_next;
          n = attr_value_set.length;
          for ( i = 0; i < n - 1; ++i ) {
            attr_value_curr = attr_value_set[i];
            attr_value_next = attr_value_set[i+1];

            if ( attr_metadata_stat[attr_id][attr_value_curr] !== attr_metadata_stat[attr_id][attr_value_next] ) {
              same_count = false;
              break;
            }
          }
          if ( same_count ) {
            var attr_value_i;
            for ( attr_value_i in attr_metadata_stat[attr_id] ) {
              attr_value[attr_value_i] = true;
            }
          }
        }
        break;
      }
    }

    switch(attr_type) {
    case 'text':
      col.innerHTML = '<textarea ' +
        'onchange="annotation_editor_on_metadata_update(this)" ' +
        'onfocus="annotation_editor_on_metadata_focus(this)" ' +
        'title="' + attr_desc + '" ' +
        'placeholder="' + attr_placeholder + '" ' +
        'id="' + attr_html_id + '">' + attr_value + '</textarea>';
      break;
    case 'checkbox':
      var options = _via_attributes[_via_metadata_being_updated][attr_id].options;
      var option_id;
      for ( option_id in options ) {
        var option_html_id = attr_html_id + '__' + option_id;
        var option = document.createElement('input');
        option.setAttribute('type', 'checkbox');
        option.setAttribute('value', option_id);
        option.setAttribute('id', option_html_id);
        option.setAttribute('onfocus', 'annotation_editor_on_metadata_focus(this)');
        option.setAttribute('onchange', 'annotation_editor_on_metadata_update(this)');

        var option_desc  = _via_attributes[_via_metadata_being_updated][attr_id].options[option_id];
        if ( option_desc === '' || typeof(option_desc) === 'undefined' ) {
          // option description is optional, use option_id when description is not present
          option_desc = option_id;
        }

        // set the value of options based on the user annotations
        if ( typeof attr_value !== 'undefined') {
          if ( attr_value.hasOwnProperty(option_id) ) {
            option.checked = attr_value[option_id];
          }
        }

        var label  = document.createElement('label');
        label.setAttribute('for', option_html_id);
        label.innerHTML = option_desc;

        var container = document.createElement('span');
        container.appendChild(option);
        container.appendChild(label);
        col.appendChild(container);
      }
      break;
    case 'radio':
      var option_id;
      for ( option_id in _via_attributes[_via_metadata_being_updated][attr_id].options ) {
        var option_html_id = attr_html_id + '__' + option_id;
        var option = document.createElement('input');
        option.setAttribute('type', 'radio');
        option.setAttribute('name', attr_html_id);
        option.setAttribute('value', option_id);
        option.setAttribute('id', option_html_id);
        option.setAttribute('onfocus', 'annotation_editor_on_metadata_focus(this)');
        option.setAttribute('onchange', 'annotation_editor_on_metadata_update(this)');

        var option_desc  = _via_attributes[_via_metadata_being_updated][attr_id].options[option_id];
        if ( option_desc === '' || typeof(option_desc) === 'undefined' ) {
          // option description is optional, use option_id when description is not present
          option_desc = option_id;
        }

        if ( attr_value === option_id ) {
          option.checked = true;
        }

        var label  = document.createElement('label');
        label.setAttribute('for', option_html_id);
        label.innerHTML = option_desc;

        var container = document.createElement('span');
        container.appendChild(option);
        container.appendChild(label);
        col.appendChild(container);
      }
      break;
    case 'image':
      var option_id;
      var option_count = 0;
      for ( option_id in _via_attributes[_via_metadata_being_updated][attr_id].options ) {
        option_count = option_count + 1;
      }
      var img_options = document.createElement('div');
      img_options.setAttribute('class', 'img_options');
      col.appendChild(img_options);

      var option_index = 0;
      for ( option_id in _via_attributes[_via_metadata_being_updated][attr_id].options ) {
        var option_html_id = attr_html_id + '__' + option_id;
        var option = document.createElement('input');
        option.setAttribute('type', 'radio');
        option.setAttribute('name', attr_html_id);
        option.setAttribute('value', option_id);
        option.setAttribute('id', option_html_id);
        option.setAttribute('onfocus', 'annotation_editor_on_metadata_focus(this)');
        option.setAttribute('onchange', 'annotation_editor_on_metadata_update(this)');

        var option_desc  = _via_attributes[_via_metadata_being_updated][attr_id].options[option_id];
        if ( option_desc === '' || typeof(option_desc) === 'undefined' ) {
          // option description is optional, use option_id when description is not present
          option_desc = option_id;
        }

        if ( attr_value === option_id ) {
          option.checked = true;
        }

        var label  = document.createElement('label');
        label.setAttribute('for', option_html_id);
        label.innerHTML = '<img src="' + option_desc + '"><p>' + option_id + '</p>';

        var container = document.createElement('span');
        container.appendChild(option);
        container.appendChild(label);
        img_options.appendChild(container);
      }
      break;

    case 'dropdown':
      var sel = document.createElement('select');
      sel.setAttribute('id', attr_html_id);
      sel.setAttribute('onfocus', 'annotation_editor_on_metadata_focus(this)');
      sel.setAttribute('onchange', 'annotation_editor_on_metadata_update(this)');
      var option_id;
      var option_selected = false;
      for ( option_id in _via_attributes[_via_metadata_being_updated][attr_id].options ) {
        var option_html_id = attr_html_id + '__' + option_id;
        var option = document.createElement('option');
        option.setAttribute('value', option_id);

        var option_desc  = _via_attributes[_via_metadata_being_updated][attr_id].options[option_id];
        if ( option_desc === '' || typeof(option_desc) === 'undefined' ) {
          // option description is optional, use option_id when description is not present
          option_desc = option_id;
        }

        if ( option_id === attr_value ) {
          option.setAttribute('selected', 'selected');
          option_selected = true;
        }
        option.innerHTML = option_desc;
        sel.appendChild(option);
      }

      if ( ! option_selected ) {
        sel.selectedIndex = '-1';
      }
      col.appendChild(sel);
      break;
    }

    row.appendChild(col);
  }
  return row;
}

function annotation_editor_scroll_to_row(row_id) {
  if ( is_annotation_editor_visible() ) {
    var row_html_id = 'ae_' + _via_metadata_being_updated + '_' + row_id;
    var row = document.getElementById(row_html_id);
    row.scrollIntoView(false);
  }
}

function annotation_editor_highlight_row(row_id) {
  if ( is_annotation_editor_visible() ) {
    var row_html_id = 'ae_' + _via_metadata_being_updated + '_' + row_id;
    var row = document.getElementById(row_html_id);
    row.classList.add('highlight');
  }
}

function annotation_editor_clear_row_highlight() {
  if ( is_annotation_editor_visible() ) {
    var ae = document.getElementById('annotation_editor');
    var i;
    for ( i=0; i<ae.childNodes.length; ++i ) {
      ae.childNodes[i].classList.remove('highlight');
    }
  }
}

function annotation_editor_extract_html_id_components(html_id) {
  // html_id : attribute_name__row-id__option_id
  var parts = html_id.split('__');
  var parsed_id = {};
  switch( parts.length ) {
  case 3:
    // html_id : attribute-id__row-id__option_id
    parsed_id.attr_id = parts[0];
    parsed_id.row_id  = parts[1];
    parsed_id.option_id = parts[2];
    break;
  case 2:
    // html_id : attribute-id__row-id
    parsed_id.attr_id = parts[0];
    parsed_id.row_id  = parts[1];
    break;
  default:
  }
  return parsed_id;
}

function _via_get_file_metadata_stat(img_index_list, attr_id) {
  var stat = {};
  stat[attr_id] = {};
  var i, n, img_id, img_index, value;
  n = img_index_list.length;
  for ( i = 0; i < n; ++i ) {
    img_index = img_index_list[i];
    img_id = _via_image_id_list[img_index];
    if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty(attr_id) ) {
      value = _via_img_metadata[img_id].file_attributes[attr_id];
      if ( typeof(value) === 'object' ) {
        // checkbox has multiple values and hence is object
        var key;
        for ( key in value ) {
          if ( stat[attr_id].hasOwnProperty(key) ) {
            stat[attr_id][key] += 1;
          } else {
            stat[attr_id][key] = 1;
          }
        }
      } else {
        if ( stat[attr_id].hasOwnProperty(value) ) {
          stat[attr_id][value] += 1;
        } else {
          stat[attr_id][value] = 1;
        }
      }
    }

  }
  return stat;
}

function _via_get_region_metadata_stat(img_index_list, attr_id) {
  var stat = {};
  stat[attr_id] = {};
  var i, n, img_id, img_index, value;
  var j, m;
  n = img_index_list.length;
  for ( i = 0; i < n; ++i ) {
    img_index = img_index_list[i];
    img_id = _via_image_id_list[img_index];
    m = _via_img_metadata[img_id].regions.length;
    for ( j = 0; j < m; ++j ) {
      if ( ! image_grid_is_region_in_current_group( _via_img_metadata[img_id].regions[j].region_attributes ) ) {
        // skip region not in current group
        continue;
      }

      value = _via_img_metadata[img_id].regions[j].region_attributes[attr_id];
      if ( typeof(value) === 'object' ) {
        // checkbox has multiple values and hence is object
        var key;
        for ( key in value ) {
          if ( stat[attr_id].hasOwnProperty(key) ) {
            stat[attr_id][key] += 1;
          } else {
            stat[attr_id][key] = 1;
          }
        }
      } else {
        if ( stat[attr_id].hasOwnProperty(value) ) {
          stat[attr_id][value] += 1;
        } else {
          stat[attr_id][value] = 1;
        }
      }
    }
  }
  return stat;
}

// invoked when the input entry in annotation editor receives focus
function annotation_editor_on_metadata_focus(p) {
  if ( _via_annotation_editor_mode === VIA_ANNOTATION_EDITOR_MODE.ALL_REGIONS ) {
    var pid       = annotation_editor_extract_html_id_components(p.id);
    var region_id = pid.row_id;
    // clear existing highlights (if any)
    toggle_all_regions_selection(false);
    annotation_editor_clear_row_highlight();
    // set new selection highlights
    set_region_select_state(region_id, true);
    annotation_editor_scroll_to_row(region_id);
    annotation_editor_highlight_row(region_id);

    _via_redraw_reg_canvas();
  }
}

// invoked when the user updates annotations using the annotation editor
function annotation_editor_on_metadata_update(p) {
  var pid       = annotation_editor_extract_html_id_components(p.id);
  var img_id    = _via_image_id;

  var img_index_list = [ _via_image_index ];
  var region_id = pid.row_id;
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    img_index_list = _via_image_grid_selected_img_index_list.slice(0);
    region_id = -1; // this flag denotes that we want to update all regions
  }

  if ( _via_metadata_being_updated === 'file' ) {
    annotation_editor_update_file_metadata(img_index_list, pid.attr_id, p.value, p.checked).then( function(update_count) {
      annotation_editor_on_metadata_update_done('file', pid.attr_id, update_count);
    }, function(err) {
      console.log(err)
      show_message('Failed to update file attributes! ' + err);
    });
    return;
  }

  if ( _via_metadata_being_updated === 'region' ) {
    annotation_editor_update_region_metadata(img_index_list, region_id, pid.attr_id, p.value, p.checked).then( function(update_count) {
      annotation_editor_on_metadata_update_done('region', pid.attr_id, update_count);
    }, function(err) {
      show_message('Failed to update region attributes! ');
    });
    return;
  }
}

function annotation_editor_on_metadata_update_done(type, attr_id, update_count) {
  show_message('Updated ' + type + ' attributes of ' + update_count + ' ' + type + 's');
  // check if the updated attribute is one of the group variables
  var i, n, type, attr_id;
  n = _via_image_grid_group_var.length;
  var clear_all_group = false;
  for ( i = 0; i < n; ++i ) {
    if ( _via_image_grid_group_var[i].type === type &&
         _via_image_grid_group_var[i].name === attr_id ) {
      clear_all_group = true;
      break;
    }
  }
  _via_regions_group_color_init();
  _via_redraw_reg_canvas();

  // @todo: it is wasteful to cancel the full set of groups.
  // we should only cancel the groups that are affected by this update.
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    if ( clear_all_group ) {
      image_grid_show_all_project_images();
    }
  }
}

function annotation_editor_update_file_metadata(img_index_list, attr_id, new_value, new_checked) {
  return new Promise( function(ok_callback, err_callback) {
    var i, n, img_id, img_index;
    n = img_index_list.length;
    var update_count = 0;
    for ( i = 0; i < n; ++i ) {
      img_index = img_index_list[i];
      img_id = _via_image_id_list[img_index];

      switch( _via_attributes['file'][attr_id].type ) {
      case 'text':  // fallback
      case 'radio': // fallback
      case 'dropdown': // fallback
      case 'image':
        _via_img_metadata[img_id].file_attributes[attr_id] = new_value;
        update_count += 1;
        break;

      case 'checkbox':
        var option_id = new_value;
        if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty(attr_id) ) {
          if ( typeof(_via_img_metadata[img_id].file_attributes[attr_id]) !== 'object' ) {
            var old_value = _via_img_metadata[img_id].file_attributes[attr_id];
            _via_img_metadata[img_id].file_attributes[attr_id] = {};
            if ( Object.keys(_via_attributes['file'][attr_id]['options']).includes(old_value) ) {
              // transform existing value as checkbox option
              _via_img_metadata[img_id].file_attributes[attr_id] = {};
              _via_img_metadata[img_id].file_attributes[attr_id][old_value] = true;
            }
          }
        } else {
          _via_img_metadata[img_id].file_attributes[attr_id] = {};
        }
        if ( new_checked ) {
          _via_img_metadata[img_id].file_attributes[attr_id][option_id] = true;
        } else {
          // false option values are not stored
          delete _via_img_metadata[img_id].file_attributes[attr_id][option_id];
        }
        update_count += 1;
        break;
      }
    }
    ok_callback(update_count);
  });
}

function annotation_editor_update_region_metadata(img_index_list, region_id, attr_id, new_value, new_checked) {
  return new Promise( function(ok_callback, err_callback) {
    var i, n, img_id, img_index;
    n = img_index_list.length;
    var update_count = 0;
    var region_list = [];
    var j, m;

    if ( region_id === -1 ) {
      // update all regions on a file (for image grid view)
      for ( i = 0; i < n; ++i ) {
        img_index = img_index_list[i];
        img_id = _via_image_id_list[img_index];

        m = _via_img_metadata[img_id].regions.length;
        for ( j = 0; j < m; ++j ) {
          if ( ! image_grid_is_region_in_current_group( _via_img_metadata[img_id].regions[j].region_attributes ) ) {
            continue;
          }

          switch( _via_attributes['region'][attr_id].type ) {
          case 'text':  // fallback
          case 'dropdown': // fallback
          case 'radio': // fallback
          case 'image':
            _via_img_metadata[img_id].regions[j].region_attributes[attr_id] = new_value;
            update_count += 1;
            break;
          case 'checkbox':
            var option_id = new_value;
            if ( _via_img_metadata[img_id].regions[j].region_attributes.hasOwnProperty(attr_id) ) {
              if ( typeof(_via_img_metadata[img_id].regions[j].region_attributes[attr_id]) !== 'object' ) {
                var old_value = _via_img_metadata[img_id].regions[j].region_attributes[attr_id];
                _via_img_metadata[img_id].regions[j].region_attributes[attr_id] = {}
                if ( Object.keys(_via_attributes['region'][attr_id]['options']).includes(old_value) ) {
                  // transform existing value as checkbox option
                  _via_img_metadata[img_id].regions[j].region_attributes[attr_id][old_value] = true;
                }
              }
            } else {
              _via_img_metadata[img_id].regions[j].region_attributes[attr_id] = {};
            }

            if ( new_checked ) {
              _via_img_metadata[img_id].regions[j].region_attributes[attr_id][option_id] = true;
            } else {
              // false option values are not stored
              delete _via_img_metadata[img_id].regions[j].region_attributes[attr_id][option_id];
            }
            update_count += 1;
            break;
          }
        }
      }
    } else {
      // update a single region in a file (for single image view)
      // update all regions on a file (for image grid view)
      for ( i = 0; i < n; ++i ) {
        img_index = img_index_list[i];
        img_id = _via_image_id_list[img_index];

        switch( _via_attributes['region'][attr_id].type ) {
        case 'text':  // fallback
        case 'dropdown': // fallback
        case 'radio': // fallback
        case 'image':
          _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id] = new_value;
          update_count += 1;
          break;
        case 'checkbox':
          var option_id = new_value;

          if ( _via_img_metadata[img_id].regions[region_id].region_attributes.hasOwnProperty(attr_id) ) {
            if ( typeof(_via_img_metadata[img_id].regions[region_id].region_attributes[attr_id]) !== 'object' ) {
              var old_value = _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id];
              _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id] = {};
              if ( Object.keys(_via_attributes['region'][attr_id]['options']).includes(old_value) ) {
                // transform existing value as checkbox option
                _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id][old_value] = true;
              }
            }
          } else {
            _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id] = {};
          }

          if ( new_checked ) {
            _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id][option_id] = true;
          } else {
            // false option values are not stored
            delete _via_img_metadata[img_id].regions[region_id].region_attributes[attr_id][option_id];
          }
          update_count += 1;
          break;
        }
      }
    }
    ok_callback(update_count);
  });
}

function set_region_annotations_to_default_value(rid) {
  var attr_id;
  for ( attr_id in _via_attributes['region'] ) {
    var attr_type = _via_attributes['region'][attr_id].type;
    switch( attr_type ) {
    case 'text':
      var default_value = _via_attributes['region'][attr_id].default_value;
      if ( typeof(default_value) !== 'undefined' ) {
        _via_img_metadata[_via_image_id].regions[rid].region_attributes[attr_id] = default_value;
      }
      break;
    case 'image':    // fallback
    case 'dropdown': // fallback
    case 'radio':
      _via_img_metadata[_via_image_id].regions[rid].region_attributes[attr_id] = '';
      var default_options = _via_attributes['region'][attr_id].default_options;
      if ( typeof(default_options) !== 'undefined' ) {
        _via_img_metadata[_via_image_id].regions[rid].region_attributes[attr_id] = Object.keys(default_options)[0];
      }
      break;

    case 'checkbox':
      _via_img_metadata[_via_image_id].regions[rid].region_attributes[attr_id] = {};
      var default_options = _via_attributes['region'][attr_id].default_options;
      if ( typeof(default_options) !== 'underfined' ) {
        var option_id;
        for ( option_id in default_options ) {
          var default_value = default_options[option_id];
          if ( typeof(default_value) !== 'underfined' ) {
            _via_img_metadata[_via_image_id].regions[rid].region_attributes[attr_id][option_id] = default_value;
          }
        }
      }
      break;
    }
  }
}

function set_file_annotations_to_default_value(image_id) {
  var attr_id;
  for ( attr_id in _via_attributes['file'] ) {
    var attr_type = _via_attributes['file'][attr_id].type;
    switch( attr_type ) {
    case 'text':
      var default_value = _via_attributes['file'][attr_id].default_value;
      _via_img_metadata[image_id].file_attributes[attr_id] = default_value;
      break;
    case 'image':    // fallback
    case 'dropdown': // fallback
    case 'radio':
      _via_img_metadata[image_id].file_attributes[attr_id] = '';
      var default_options = _via_attributes['file'][attr_id].default_options;
      _via_img_metadata[image_id].file_attributes[attr_id] = Object.keys(default_options)[0];
      break;
    case 'checkbox':
      _via_img_metadata[image_id].file_attributes[attr_id] = {};
      var default_options = _via_attributes['file'][attr_id].default_options;
      var option_id;
      for ( option_id in default_options ) {
        var default_value = default_options[option_id];
        _via_img_metadata[image_id].file_attributes[attr_id][option_id] = default_value;
      }
      break;
    }
  }
}

function annotation_editor_increase_panel_height() {
  var p = document.getElementById('annotation_editor_panel');
  if ( _via_settings.ui.annotation_editor_height < 80 ) {
    _via_settings.ui.annotation_editor_height += VIA_ANNOTATION_EDITOR_HEIGHT_CHANGE;
    p.style.width = _via_settings.ui.annotation_editor_height + '%';
  }
}

function annotation_editor_decrease_panel_height() {
  var p = document.getElementById('annotation_editor_panel');
  if ( _via_settings.ui.annotation_editor_height > 10 ) {
    _via_settings.ui.annotation_editor_height -= VIA_ANNOTATION_EDITOR_HEIGHT_CHANGE;
    p.style.width = _via_settings.ui.annotation_editor_height + '%';
  }
}

function annotation_editor_increase_content_size() {
  var p = document.getElementById('annotation_editor_panel');
  if ( _via_settings.ui.annotation_editor_fontsize < 1.6 ) {
    _via_settings.ui.annotation_editor_fontsize += VIA_ANNOTATION_EDITOR_FONTSIZE_CHANGE;
    p.style.fontSize = _via_settings.ui.annotation_editor_fontsize + 'rem';
  }
}

function annotation_editor_decrease_content_size() {
  var p = document.getElementById('annotation_editor_panel');
  if ( _via_settings.ui.annotation_editor_fontsize > 0.4 ) {
    _via_settings.ui.annotation_editor_fontsize -= VIA_ANNOTATION_EDITOR_FONTSIZE_CHANGE;
    p.style.fontSize = _via_settings.ui.annotation_editor_fontsize + 'rem';
  }
}

//
// via project
//
function project_set_name(name) {
  _via_settings.project.name = name;

  var p = document.getElementById('project_name');
  p.value = _via_settings.project.name;
}

function project_init_default_project() {
  if ( ! _via_settings.hasOwnProperty('project') ) {
    _via_settings.project = {};
  }

  project_set_name( project_get_default_project_name() );
}

function project_on_name_update(p) {
  project_set_name(p.value);
}

function project_get_default_project_name() {
  const now = new Date();
  var MONTH_SHORT_NAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var ts = now.getDate() + MONTH_SHORT_NAME[now.getMonth()] + now.getFullYear() +
      '_' + now.getHours() + 'h' + now.getMinutes() + 'm';

  var project_name = 'via_project_' + ts;
  return project_name;
}

function project_save_with_confirm() {
  var config = {'title':'Save Project' };
  var input = { 'project_name': { type:'text', name:'Project Name', value:_via_settings.project.name, disabled:false, size:30 },
                'save_annotations':{ type:'checkbox', name:'Save region and file annotations (i.e. manual annotations)', checked:true, disabled:false},
                'save_attributes':{ type:'checkbox', name:'Save region and file attributes.', checked:true},
                'save_via_settings':{ type:'checkbox', name:'Save VIA application settings', checked:true},
                //                'save_base64_data':{ type:'checkbox', name:'Save base64 data of images (if present)', checked:false},
                //                'save_images':{type:'checkbox', 'name':'Save images <span class="warning">(WARNING: only recommended for projects containing small number of images)</span>', value:false},
              };

  invoke_with_user_inputs(project_save_confirmed, input, config);
}

function project_save_confirmed(input) {
  if ( input.project_name.value !== _via_settings.project.name ) {
    project_set_name(input.project_name.value);
  }

  // via project
  var _via_project = { '_via_settings': _via_settings,
                       '_via_img_metadata': _via_img_metadata,
                       '_via_attributes': _via_attributes,
                       '_via_data_format_version': '2.0.10',
                       '_via_image_id_list': _via_image_id_list
                     };

  var filename = input.project_name.value + '.json';
  var data_blob = new Blob( [JSON.stringify(_via_project)],
                            {type: 'text/json;charset=utf-8'});

  save_data_to_local_file(data_blob, filename);

  user_input_default_cancel_handler();
}

function project_open_select_project_file() {
  if (invisible_file_input) {
    invisible_file_input.accept = '.json';
    invisible_file_input.onchange = project_open;
    invisible_file_input.removeAttribute('multiple');
    invisible_file_input.click();
  }
}

function project_open(event) {
  var selected_file = event.target.files[0];
  load_text_file(selected_file, project_open_parse_json_file);
}

function project_open_parse_json_file(project_file_data) {
  var d = JSON.parse(project_file_data);
  if ( d['_via_settings'] && d['_via_img_metadata'] && d['_via_attributes'] ) {
    // import settings
    project_import_settings(d['_via_settings']);

    // clear existing data (if any)
    _via_image_id_list = [];
    _via_image_filename_list = [];
    _via_img_count = 0;
    _via_img_metadata = {};
    _via_img_fileref = {};
    _via_img_src = {};
    _via_attributes = { 'region':{}, 'file':{} };
    _via_buffer_remove_all();

    // import image metadata
    _via_img_metadata = {};
    for ( var img_id in d['_via_img_metadata'] ) {
      if('filename' in d['_via_img_metadata'][img_id] &&
         'size' in d['_via_img_metadata'][img_id] &&
         'regions' in d['_via_img_metadata'][img_id] &&
         'file_attributes' in d['_via_img_metadata'][img_id]) {
        if( !d.hasOwnProperty('_via_image_id_list') ) {
          _via_image_id_list.push(img_id);
          _via_image_filename_list.push( d['_via_img_metadata'][img_id].filename );
        }

        set_file_annotations_to_default_value(img_id);
        _via_img_metadata[img_id] = d['_via_img_metadata'][img_id];
        _via_img_count += 1;
      } else {
        console.log('discarding malformed entry for ' + img_id +
                    ': ' + JSON.stringify(d['_via_img_metadata'][img_id]));
      }
    }

    if ( d.hasOwnProperty('_via_image_id_list') ) {
      _via_image_id_list = d['_via_image_id_list'];
      for(var img_id_index in d['_via_image_id_list']) {
        var img_id = d['_via_image_id_list'][img_id_index];
        _via_image_filename_list.push(_via_img_metadata[img_id]['filename']);
      }
    }

    // import attributes
    _via_attributes = d['_via_attributes'];
    project_parse_via_attributes_from_img_metadata();
    var fattr_id_list = Object.keys(_via_attributes['file']);
    var rattr_id_list = Object.keys(_via_attributes['region']);
    if ( rattr_id_list.length ) {
      _via_attribute_being_updated = 'region';
      _via_current_attribute_id = rattr_id_list[0];
    } else {
      if ( fattr_id_list.length ) {
        _via_attribute_being_updated = 'file';
        _via_current_attribute_id = fattr_id_list[0];
      }
    }

    if ( _via_settings.core.default_filepath !== '' ) {
      _via_file_resolve_all_to_default_filepath();
    }

    show_message('Imported project [' + _via_settings['project'].name + '] with ' + _via_img_count + ' files.');

    if ( _via_img_count > 0 ) {
      _via_show_img(0);
      update_img_fn_list();
      _via_reload_img_fn_list_table = true;
    }
  } else {
    show_message('Cannot import project from a corrupt file!');
  }
}

function project_parse_via_attributes_from_img_metadata() {
  // parse _via_img_metadata to populate _via_attributes
  var img_id, fa, ra;

  if ( ! _via_attributes.hasOwnProperty('file') ) {
    _via_attributes['file'] = {};
  }
  if ( ! _via_attributes.hasOwnProperty('region') ) {
    _via_attributes['region'] = {};
  }

  for ( img_id in _via_img_metadata ) {
    // file attributes
    for ( fa in _via_img_metadata[img_id].file_attributes ) {
      if ( ! _via_attributes['file'].hasOwnProperty(fa) ) {
        _via_attributes['file'][fa] = {};
        _via_attributes['file'][fa]['type'] = 'text';
      }
    }
    // region attributes
    var ri;
    for ( ri = 0; ri < _via_img_metadata[img_id].regions.length; ++ri ) {
      for ( ra in _via_img_metadata[img_id].regions[ri].region_attributes ) {
        if ( ! _via_attributes['region'].hasOwnProperty(ra) ) {
          _via_attributes['region'][ra] = {};
          _via_attributes['region'][ra]['type'] = 'text';
        }
      }
    }
  }
}

function project_import_settings(s) {
  // @todo find a generic way to import into _via_settings
  // only the components present in s (and not overwrite everything)
  var k1;
  for ( k1 in s ) {
    if ( typeof( s[k1] ) === 'object' ) {
      var k2;
      for ( k2 in s[k1] ) {
        if ( typeof( s[k1][k2] ) === 'object' ) {
          var k3;
          for ( k3 in s[k1][k2] ) {
            _via_settings[k1][k2][k3] = s[k1][k2][k3];
          }
        } else {
          _via_settings[k1][k2] = s[k1][k2];
        }
      }
    } else {
      _via_settings[k1] = s[k1];
    }
  }
}

function project_file_remove_with_confirm() {
  var img_id = _via_image_id_list[_via_image_index];
  var filename = _via_img_metadata[img_id].filename;
    project_file_remove_confirmed({
      'img_index': { value:(_via_image_index + 1) },
      'filename': { value:filename }
    });
}

function project_file_remove_confirmed(input) {
  var img_index = input.img_index.value - 1;
  project_remove_file(img_index);

  if ( img_index === _via_img_count ) {
    if ( _via_img_count === 0 ) {
      _via_current_image_loaded = false;
      show_home_panel();
    } else {
      _via_show_img(img_index - 1);
    }
  } else {
    _via_show_img(img_index);
  }
  _via_reload_img_fn_list_table = true;
  update_img_fn_list();
  show_message('Removed file [' + input.filename.value + '] from project');
  user_input_default_cancel_handler();
}


function project_remove_file(img_index) {
  if ( img_index < 0 || img_index >= _via_img_count ) {
    console.log('project_remove_file(): invalid img_index ' + img_index);
    return;
  }
  var img_id = _via_image_id_list[img_index];

  // remove img_index from all array
  // this invalidates all image_index > img_index
  _via_image_id_list.splice( img_index, 1 );
  _via_image_filename_list.splice( img_index, 1 );

  var img_fn_list_index = _via_img_fn_list_img_index_list.indexOf(img_index);
  if ( img_fn_list_index !== -1 ) {
    _via_img_fn_list_img_index_list.splice( img_fn_list_index, 1 );
  }

  // clear all buffer
  // @todo: it is wasteful to clear all the buffer instead of removing a single image
  _via_buffer_remove_all();
  img_fn_list_clear_css_classname('buffered');

  _via_clear_reg_canvas();
  delete _via_img_metadata[img_id];
  delete _via_img_src[img_id];
  delete _via_img_fileref[img_id];

  _via_img_count -= 1;
}

function project_add_new_file(filename, size, file_id) {
  var img_id = file_id;
  if ( typeof(img_id) === 'undefined' ) {
    if ( typeof(size) === 'undefined' ) {
      size = -1;
    }
    img_id = _via_get_image_id(filename, size);
  }

  if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
    _via_img_metadata[img_id] = new file_metadata(filename, size);
    _via_image_id_list.push(img_id);
    _via_image_filename_list.push(filename);
    _via_img_count += 1;
  }
  return img_id;
}

function project_file_add_local(event) {
  var user_selected_images = event.target.files;
  var original_image_count = _via_img_count;

  var new_img_index_list = [];
  var discarded_file_count = 0;
  for ( var i = 0; i < user_selected_images.length; ++i ) {
    var filetype = user_selected_images[i].type.substr(0, 5);
    if ( filetype === 'image' ) {
      // check which filename in project matches the user selected file
      var img_index = _via_image_filename_list.indexOf(user_selected_images[i].name);
       if( img_index === -1) {
        // a new file was added to project
        var new_img_id = project_add_new_file(user_selected_images[i].name,
                                              user_selected_images[i].size);
        _via_img_fileref[new_img_id] = user_selected_images[i];
        set_file_annotations_to_default_value(new_img_id);
        new_img_index_list.push( _via_image_id_list.indexOf(new_img_id) );
      } else {
        // an existing file was resolved using browser's file selector
        var img_id = _via_image_id_list[img_index];
        _via_img_fileref[img_id] = user_selected_images[i];
        _via_img_metadata[img_id]['size'] = user_selected_images[i].size;
      }
    } else {
      discarded_file_count += 1;
    }
  }

  if ( _via_img_metadata ) {
    var status_msg = 'Loaded ' + new_img_index_list.length + ' images.';
    if ( discarded_file_count ) {
      status_msg += ' ( Discarded ' + discarded_file_count + ' non-image files! )';
    }
    show_message(status_msg);

    if ( new_img_index_list.length ) {
      // show first of newly added image
      _via_show_img( new_img_index_list[0] );
    } else {
      // show original image
      _via_show_img ( _via_image_index );
    }
    update_img_fn_list();
  } else {
    show_message("Please upload some image files!");
  }
}

function project_file_add_abs_path_with_input() {
  var config = {'title':'Add File using Absolute Path' };
  var input = { 'absolute_path': { type:'text', name:'add one absolute path', placeholder:'/home/abhishek/image1.jpg', disabled:false, size:50 },
		'absolute_path_list': { type:'textarea', name:'or, add multiple paths (one path per line)', placeholder:'/home/abhishek/image1.jpg\n/home/abhishek/image2.jpg\n/home/abhishek/image3.png', disabled:false, rows:5, cols:80 }
              };

  invoke_with_user_inputs(project_file_add_abs_path_input_done, input, config);
}

function project_file_add_abs_path_input_done(input) {
  if ( input.absolute_path.value !== '' ) {
    var abs_path  = input.absolute_path.value.trim();
    var img_id    = project_file_add_url(abs_path);
    var img_index = _via_image_id_list.indexOf(img_id);
    _via_show_img(img_index);
    show_message('Added file at absolute path [' + abs_path + ']');
    update_img_fn_list();
    user_input_default_cancel_handler();
  } else {
    if ( input.absolute_path_list.value !== '' ) {
      var absolute_path_list_str = input.absolute_path_list.value;
      import_files_url_from_csv(absolute_path_list_str);
    }
  }
}

function project_file_add_url_with_input() {
  var config = {'title':'Add File using URL' };
  var input = { 'url': { type:'text', name:'add one URL', placeholder:'http://www.robots.ox.ac.uk/~vgg/software/via/images/swan.jpg', disabled:false, size:50 },
		'url_list': { type:'textarea', name:'or, add multiple URL (one url per line)', placeholder:'http://www.example.com/image1.jpg\nhttp://www.example.com/image2.jpg\nhttp://www.example.com/image3.png', disabled:false, rows:5, cols:80 }
              };

  invoke_with_user_inputs(project_file_add_url_input_done, input, config);
}

function project_file_add_url_input_done(input) {
  if ( input.url.value !== '' ) {
    var url = input.url.value.trim();
    var img_id    = project_file_add_url(url);
    var img_index = _via_image_id_list.indexOf(img_id);
    show_message('Added file at url [' + url + ']');
    update_img_fn_list();
    _via_show_img(img_index);
    user_input_default_cancel_handler();
  } else {
    if ( input.url_list.value !== '' ) {
      var url_list_str = input.url_list.value;
      import_files_url_from_csv(url_list_str);
    }
  }
}

function project_file_add_url(url) {
  if ( url !== '' ) {
    var size = -1; // convention: files added using url have size = -1
    var img_id   = _via_get_image_id(url, size);

    if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
      img_id = project_add_new_file(url);
      _via_img_src[img_id] = _via_img_metadata[img_id].filename;
      set_file_annotations_to_default_value(img_id);
      return img_id;
    }
  }
}

function project_file_add_base64(filename, base64) {
  var size = -1; // convention: files added using url have size = -1
  var img_id   = _via_get_image_id(filename, size);

  if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
    img_id = project_add_new_file(filename, size);
    _via_img_src[img_id] = base64;
    set_file_annotations_to_default_value(img_id);
  }
}

function project_file_load_on_fail(img_index) {
  var img_id = _via_image_id_list[img_index];
  _via_img_src[img_id] = '';
  _via_image_load_error[img_index] = true;
  img_fn_list_ith_entry_error(img_index, true);
}

function project_file_load_on_success(img_index) {
  _via_image_load_error[img_index] = false;
  img_fn_list_ith_entry_error(img_index, false);
}

function project_settings_toggle() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.SETTINGS ) {
    show_single_image_view();
  } else {
    project_settings_show();
  }
}

function project_settings_show() {
  set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.SETTINGS);
}

function project_filepath_add_from_input(p, button) {
  var new_path = document.getElementById(p).value.trim();
  var img_index = parseInt(button.getAttribute('value'));
  project_filepath_add(new_path);
  _via_show_img(img_index);
}

function project_filepath_add(new_path) {
  if ( path === '' ) {
    return;
  }

  if ( _via_settings.core.filepath.hasOwnProperty(new_path) ) {
    return;
  } else {
    var largest_order = 0;
    var path;
    for ( path in _via_settings.core.filepath ) {
      if ( _via_settings.core.filepath[path] > largest_order ) {
        largest_order = _via_settings.core.filepath[path];
      }
    }
    _via_settings.core.filepath[new_path] = largest_order + 1;

  }
}

function project_filepath_del(path) {
  if ( _via_settings.core.filepath.hasOwnProperty(path) ) {
    delete _via_settings.core.filepath[path];
  }
}

function project_save_attributes() {
  var blob_attr = {type: 'application/json;charset=utf-8'};
  var all_region_data_blob = new Blob( [ JSON.stringify(_via_attributes) ], blob_attr);

  save_data_to_local_file(all_region_data_blob, _via_settings.project.name + '_attributes.json');
}

function project_import_attributes_from_file(event) {
  var selected_files = event.target.files;
  for ( var i = 0; i < selected_files.length; ++i ) {
    var file = selected_files[i];
    load_text_file(file, project_import_attributes_from_json);
  }
}

function project_import_attributes_from_json(data) {
  try {
    var d = JSON.parse(data);
    var attr;
    var fattr_count = 0;
    var rattr_count = 0;
    // process file attributes
    for ( attr in d['file'] ) {
      _via_attributes['file'][attr] = JSON.parse( JSON.stringify( d['file'][attr] ) );
      fattr_count += 1;
    }

    // process region attributes
    for ( attr in d['region'] ) {
      _via_attributes['region'][attr] = JSON.parse( JSON.stringify( d['region'][attr] ) );
      rattr_count += 1;
    }

    if ( fattr_count > 0 || rattr_count > 0 ) {
      var fattr_id_list = Object.keys(_via_attributes['file']);
      var rattr_id_list = Object.keys(_via_attributes['region']);
      if ( rattr_id_list.length ) {
        _via_attribute_being_updated = 'region';
        _via_current_attribute_id = rattr_id_list[0];
      } else {
        if ( fattr_id_list.length ) {
          _via_attribute_being_updated = 'file';
          _via_current_attribute_id = fattr_id_list[0];
        }
      }
      attribute_update_panel_set_active_button();
      update_attributes_update_panel();
      annotation_editor_update_content();
    }
    show_message('Imported ' + fattr_count + ' file attributes and '
                 + rattr_count + ' region attributes');
  } catch (error) {
    show_message('Failed to import attributes: [' + error + ']');
  }
}

//
// image grid
//
function image_grid_init() {
  var p = document.getElementById('image_grid_content');
  p.focus();
  p.addEventListener('mousedown', image_grid_mousedown_handler, false);
  p.addEventListener('mouseup', image_grid_mouseup_handler, false);
  p.addEventListener('dblclick', image_grid_dblclick_handler, false);

  image_grid_set_content_panel_height_fixed();

  // select policy as defined in settings
  var i, option;
  var p = document.getElementById('image_grid_show_image_policy');
  var n = p.options.length;
  for ( i = 0; i < n; ++i ) {
    if ( p.options[i].value === _via_settings.ui.image_grid.show_image_policy ) {
      p.selectedIndex = i;
      break;
    }
  }
}

function image_grid_update() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_set_content( _via_image_grid_img_index_list );
  }
}

function image_grid_toggle() {
  var p = document.getElementById('toolbar_image_grid_toggle');
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE_GRID ) {
    image_grid_clear_all_groups();
    show_single_image_view();
  } else {
    show_image_grid_view();
  }
}

function image_grid_show_all_project_images() {
  var all_img_index_list = [];
  var i, n;
  //n = _via_image_id_list.length;
  n = _via_img_fn_list_img_index_list.length;
  for ( i = 0; i < n; ++i ) {
    all_img_index_list.push( _via_img_fn_list_img_index_list[i] );
  }
  image_grid_clear_all_groups();

  var p = document.getElementById('image_grid_toolbar_group_by_select');
  p.selectedIndex = 0;

  image_grid_set_content(all_img_index_list);
}

function image_grid_clear_all_groups() {
  var i, n;
  n = _via_image_grid_group_var.length;
  for ( i = 0; i < n; ++i ) {
    image_grid_remove_html_group_panel( _via_image_grid_group_var[i] );
    image_grid_group_by_select_set_disabled( _via_image_grid_group_var[i].type,
                                             _via_image_grid_group_var[i].name,
                                             false);
  }
  _via_image_grid_group = {};
  _via_image_grid_group_var = [];

}

function image_grid_set_content(img_index_list) {
  if ( img_index_list.length === 0 ) {
    return;
  }
  if ( _via_image_grid_load_ongoing ) {
    return;
  }

  _via_image_grid_img_index_list = img_index_list.slice(0);
  _via_image_grid_selected_img_index_list = img_index_list.slice(0);

  document.getElementById('image_grid_group_by_img_count').innerHTML = _via_image_grid_img_index_list.length;

  _via_image_grid_page_first_index    = 0;
  _via_image_grid_page_last_index     = null;
  _via_image_grid_stack_prev_page     = [];
  _via_image_grid_page_img_index_list = [];

  image_grid_clear_content();
  image_grid_set_content_panel_height_fixed();
  _via_image_grid_load_ongoing = true;

  var n = _via_image_grid_img_index_list.length;
  switch ( _via_settings.ui.image_grid.show_image_policy ) {
  case 'all':
    _via_image_grid_page_img_index_list = _via_image_grid_img_index_list.slice(0);
    break;
  case 'first_mid_last':
    if ( n < 3 ) {
      var i;
      for ( i = 0; i < n; ++i ) {
        _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[i] );
      }
    } else {
      _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[0] );
      _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[ Math.floor(n/2) ] );
      _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[n-1] );
    }
    break;
  case 'even_indexed':
    var i;
    for ( i = 0; i < n; ++i ) {
      if ( i % 2 !== 0 ) { // since the user views (i+1) based indexing
        _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[i] );
      }
    }
    break;
  case 'odd_indexed':
    var i;
    for ( i = 0; i < n; ++i ) {
      if ( i % 2 === 0 ) { // since the user views (i+1) based indexing
        _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[i] );
      }
    }
    break;
  case 'gap5':  // fallback
  case 'gap25': // fallback
  case 'gap50': // fallback
    var del = parseInt( _via_settings.ui.image_grid.show_image_policy.substr( 'gap'.length ) );
    var i;
    for ( i = 0; i < n; i = i + del ) {
      _via_image_grid_page_img_index_list.push( _via_image_grid_img_index_list[i] );
    }
    break;
  }

  _via_image_grid_visible_img_index_list = [];

  image_grid_update_sel_count_html();
  annotation_editor_update_content();

  image_grid_content_append_img( _via_image_grid_page_first_index );

  show_message('[Click] toggles selection, ' +
               '[Shift + Click] selects everything a image, ' +
               '[Click] or [Ctrl + Click] removes selection of all subsequent or preceeding images.');
}

function image_grid_clear_content() {
  var img_container = document.getElementById('image_grid_content_img');
  var img_rshape = document.getElementById('image_grid_content_rshape');
  img_container.innerHTML = '';
  img_rshape.innerHTML = '';
  _via_image_grid_visible_img_index_list = [];
}

function image_grid_set_content_panel_height_fixed() {
  var pc = document.getElementById('image_grid_content');
  var de = document.documentElement;
  pc.style.height = (de.clientHeight - 5.5*ui_top_panel.offsetHeight) + 'px';
}

// We do not know how many images will fit in the display area.
// Therefore, we add images one-by-one until overflow of parent
// container is detected.
function image_grid_content_append_img( img_grid_index ) {
  var img_index   = _via_image_grid_page_img_index_list[img_grid_index];
  var html_img_id = image_grid_get_html_img_id(img_index);
  var img_id      = _via_image_id_list[img_index];
  var e = document.createElement('img');
  if ( _via_img_fileref[img_id] instanceof File ) {
    var img_reader = new FileReader();
    img_reader.addEventListener( "error", function() {
      //@todo
    }, false);
    img_reader.addEventListener( "load", function() {
      e.src = img_reader.result;
    }, false);
    img_reader.readAsDataURL( _via_img_fileref[img_id] );
  } else {
    e.src = _via_img_src[img_id];
  }
  e.setAttribute('id', html_img_id);
  e.setAttribute('height', _via_settings.ui.image_grid.img_height + 'px');
  e.setAttribute('title', '[' + (img_index+1) + '] ' + _via_img_metadata[img_id].filename);

  e.addEventListener('load', image_grid_on_img_load, false);
  e.addEventListener('error', image_grid_on_img_error, false);
  document.getElementById('image_grid_content_img').appendChild(e);
}

function image_grid_on_img_load(e) {
  var img = e.target;
  var img_index = image_grid_parse_html_img_id(img.id);
  project_file_load_on_success(img_index);

  image_grid_add_img_if_possible(img);
}

function image_grid_on_img_error(e) {
  var img       = e.target;
  var img_index = image_grid_parse_html_img_id(img.id);
  project_file_load_on_fail(img_index);
  image_grid_add_img_if_possible(img);
}

function image_grid_add_img_if_possible(img) {
  var img_index = image_grid_parse_html_img_id(img.id);

  var p = document.getElementById('image_grid_content_img');
  var img_bottom_right_corner = parseInt(img.offsetTop) + parseInt(img.height);
  if ( p.clientHeight < img_bottom_right_corner ) {
    // stop as addition of this image caused overflow of parent container
    var img_container = document.getElementById('image_grid_content_img');
    img_container.removeChild(img);

    if ( _via_settings.ui.image_grid.show_region_shape ) {
      image_grid_page_show_all_regions();
    }
    _via_image_grid_load_ongoing = false;

    var index = _via_image_grid_page_img_index_list.indexOf(img_index);
    _via_image_grid_page_last_index = index;

    // setup prev, next navigation
    var info = document.getElementById('image_grid_nav');
    var html = [];
    var first_index = _via_image_grid_page_first_index;
    var last_index  = _via_image_grid_page_last_index - 1;
    html.push('<span>Showing&nbsp;' + (first_index + 1) +
              ' to ' + (last_index + 1) + '&nbsp;:</span>');
    if ( _via_image_grid_stack_prev_page.length ) {
      html.push('<span class="text_button" onclick="image_grid_page_prev()">Prev</span>');
    } else {
      html.push('<span>Prev</span>');
    }
    html.push('<span class="text_button" onclick="image_grid_page_next()">Next</span');
    info.innerHTML = html.join('');
  } else {
    // process this image and trigger addition of next image in sequence
    var img_fn_list_index = _via_image_grid_page_img_index_list.indexOf(img_index);
    var next_img_fn_list_index = img_fn_list_index + 1;

    _via_image_grid_visible_img_index_list.push( img_index );
    var is_selected = ( _via_image_grid_selected_img_index_list.indexOf(img_index) !== -1 );
    if ( ! is_selected ) {
      image_grid_update_img_select(img_index, 'unselect');
    }

    if ( next_img_fn_list_index !==  _via_image_grid_page_img_index_list.length ) {
      if ( _via_image_grid_load_ongoing ) {
        image_grid_content_append_img( img_fn_list_index + 1 );
      } else {
        // image grid load operation was cancelled
        _via_image_grid_page_last_index = _via_image_grid_page_first_index; // load this page again

        var info = document.getElementById('image_grid_nav');
        var html = [];
        html.push('<span>Cancelled&nbsp;:</span>');
        if ( _via_image_grid_stack_prev_page.length ) {
          html.push('<span class="text_button" onclick="image_grid_page_prev()">Prev</span>');
        } else {
          html.push('<span>Prev</span>');
        }
        html.push('<span class="text_button" onclick="image_grid_page_next()">Next</span');
        info.innerHTML = html.join('');
      }
    } else {
      // last page
      var index = _via_image_grid_page_img_index_list.indexOf(img_index);
      _via_image_grid_page_last_index = index;

      if ( _via_settings.ui.image_grid.show_region_shape ) {
        image_grid_page_show_all_regions();
      }
      _via_image_grid_load_ongoing = false;

      // setup prev, next navigation
      var info = document.getElementById('image_grid_nav');
      var html = [];
      var first_index = _via_image_grid_page_first_index;
      var last_index  = _via_image_grid_page_last_index;
      html.push('<span>Showing&nbsp;' + (first_index + 1) +
                ' to ' + (last_index + 1) + ' (end)&nbsp;</span>');
      if ( _via_image_grid_stack_prev_page.length ) {
        html.push('<span class="text_button" onclick="image_grid_page_prev()">Prev</span>');
      } else {
        html.push('<span>Prev</span>');
      }
      html.push('<span>Next</span');

      info.innerHTML = html.join('');
    }
  }
}

function image_grid_onchange_show_image_policy(p) {
  _via_settings.ui.image_grid.show_image_policy = p.options[p.selectedIndex].value;
  image_grid_set_content(_via_image_grid_img_index_list);
}

function image_grid_page_show_all_regions() {
  var all_promises = [];
  if ( _via_settings.ui.image_grid.show_region_shape ) {
    var p = document.getElementById('image_grid_content_img');
    var n = p.childNodes.length;
    var i;
    for ( i = 0; i < n; ++i ) {
      // draw region shape into global canvas for image grid
      var img_index = image_grid_parse_html_img_id( p.childNodes[i].id );
      var img_param = []; // [width, height, originalWidth, originalHeight, x, y]
      img_param.push( parseInt(p.childNodes[i].width) );
      img_param.push( parseInt(p.childNodes[i].height) );
      img_param.push( parseInt(p.childNodes[i].naturalWidth) );
      img_param.push( parseInt(p.childNodes[i].naturalHeight) );
      img_param.push( parseInt(p.childNodes[i].offsetLeft) + parseInt(p.childNodes[i].clientLeft) );
      img_param.push( parseInt(p.childNodes[i].offsetTop) + parseInt(p.childNodes[i].clientTop) );
      var promise = image_grid_show_region_shape( img_index, img_param );
      all_promises.push( promise );
    }
    // @todo: ensure that all promises are fulfilled
  }
}

function image_grid_is_region_in_current_group(r) {
  var i, n;
  n = _via_image_grid_group_var.length;
  if ( n === 0 ) {
    return true;
  }

  for ( i = 0; i < n; ++i ) {
    if ( _via_image_grid_group_var[i].type === 'region' ) {
      var group_value = _via_image_grid_group_var[i].values[ _via_image_grid_group_var[i].current_value_index ];
      if ( r[_via_image_grid_group_var[i].name] != group_value ) {
        return false;
      }
    }
  }
  return true;
}

function image_grid_show_region_shape(img_index, img_param) {
  return new Promise( function(ok_callback, err_callback) {
    var i;
    var img_id = _via_image_id_list[img_index];
    var html_img_id = image_grid_get_html_img_id(img_index);
    var n = _via_img_metadata[img_id].regions.length;
    var is_in_group = false;
    for ( i = 0; i < n; ++i ) {
      if ( ! image_grid_is_region_in_current_group( _via_img_metadata[img_id].regions[i].region_attributes ) ) {
        // skip drawing this region which is not in current group
        continue;
      }

      var r = _via_img_metadata[img_id].regions[i].shape_attributes;
      var dimg; // region coordinates in original image space
      switch( r.name ) {
      case VIA_REGION_SHAPE.RECT:
        dimg = [ r['x'], r['y'], r['x']+r['width'], r['y']+r['height'] ];
        break;
      case VIA_REGION_SHAPE.CIRCLE:
        dimg = [ r['cx'], r['cy'], r['cx']+r['r'], r['cy']+r['r'] ];
        break;
      case VIA_REGION_SHAPE.ELLIPSE:
        dimg = [ r['cx'], r['cy'], r['cx']+r['rx'], r['cy']+r['ry'] ];
        break;
      case VIA_REGION_SHAPE.POLYLINE: // handled by POLYGON
      case VIA_REGION_SHAPE.POLYGON:
        var j;
        dimg = [];
        for ( j = 0; j < r['all_points_x'].length; ++j ) {
          dimg.push( r['all_points_x'][j] );
          dimg.push( r['all_points_y'][j] );
        }
        break;
      case VIA_REGION_SHAPE.POINT:
        dimg = [ r['cx'], r['cy'] ];
        break;
      }
      var scale_factor = img_param[1] / img_param[3]; // new_height / original height
      var offset_x     = img_param[4];
      var offset_y     = img_param[5];
      var r2 = new _via_region( r.name, i, dimg, scale_factor, offset_x, offset_y);
      var r2_svg = r2.get_svg_element();
      r2_svg.setAttribute('id', image_grid_get_html_region_id(img_index, i));
      r2_svg.setAttribute('class', html_img_id);
      r2_svg.setAttribute('fill',         _via_settings.ui.image_grid.rshape_fill);
      //r2_svg.setAttribute('fill-opacity', _via_settings.ui.image_grid.rshape_fill_opacity);
      r2_svg.setAttribute('stroke',       _via_settings.ui.image_grid.rshape_stroke);
      r2_svg.setAttribute('stroke-width', _via_settings.ui.image_grid.rshape_stroke_width);

      document.getElementById('image_grid_content_rshape').appendChild(r2_svg);
    }
  });
}

function image_grid_image_size_increase() {
  var new_img_height = _via_settings.ui.image_grid.img_height + VIA_IMAGE_GRID_IMG_HEIGHT_CHANGE;
  _via_settings.ui.image_grid.img_height = new_img_height;

  _via_image_grid_page_last_index = null;
  image_grid_update();
}

function image_grid_image_size_decrease() {
  var new_img_height = _via_settings.ui.image_grid.img_height - VIA_IMAGE_GRID_IMG_HEIGHT_CHANGE;
  if ( new_img_height > 1 ) {
    _via_settings.ui.image_grid.img_height = new_img_height;
    _via_image_grid_page_last_index = null;
    image_grid_update();
  }
}

function image_grid_image_size_reset() {
  var new_img_height = _via_settings.ui.image_grid.img_height;
  if ( new_img_height > 1 ) {
    _via_settings.ui.image_grid.img_height = new_img_height;
    _via_image_grid_page_last_index = null;
    image_grid_update();
  }
}

function image_grid_mousedown_handler(e) {
  e.preventDefault();
  _via_image_grid_mousedown_img_index = image_grid_parse_html_img_id(e.target.id);
}

function image_grid_mouseup_handler(e) {
  e.preventDefault();
  var last_mouseup_img_index = _via_image_grid_mouseup_img_index;
  _via_image_grid_mouseup_img_index = image_grid_parse_html_img_id(e.target.id);
  if ( isNaN(_via_image_grid_mousedown_img_index) ||
       isNaN(_via_image_grid_mouseup_img_index)) {
    last_mouseup_img_index = _via_image_grid_img_index_list[0];
    image_grid_group_select_none();
    return;
  }

  var mousedown_img_arr_index = _via_image_grid_img_index_list.indexOf(_via_image_grid_mousedown_img_index);
  var mouseup_img_arr_index = _via_image_grid_img_index_list.indexOf(_via_image_grid_mouseup_img_index);

  var start = -1;
  var end   = -1;
  var operation = 'select'; // {'select', 'unselect', 'toggle'}
  if ( mousedown_img_arr_index === mouseup_img_arr_index ) {
    if ( e.shiftKey ) {
      // select all elements until this element
      start = _via_image_grid_img_index_list.indexOf(last_mouseup_img_index) + 1;
      end   = mouseup_img_arr_index + 1;
    } else {
      // toggle selection of single image
      start = mousedown_img_arr_index;
      end   = start + 1;
      operation = 'toggle';
    }
  } else {
    if ( mousedown_img_arr_index < mouseup_img_arr_index ) {
      start = mousedown_img_arr_index;
      end   = mouseup_img_arr_index + 1;
    } else {
      start = mouseup_img_arr_index + 1;
      end   = mousedown_img_arr_index;
    }
    operation = 'toggle';
  }

  if ( start > end ) {
    return;
  }

  var i, img_index;
  for ( i = start; i < end; ++i ) {
    img_index = _via_image_grid_img_index_list[i];
    image_grid_update_img_select(img_index, operation);
  }
  image_grid_update_sel_count_html();
  annotation_editor_update_content();
}

function image_grid_update_sel_count_html() {
  document.getElementById('image_grid_group_by_sel_img_count').innerHTML = _via_image_grid_selected_img_index_list.length;
}

// state \in {'select', 'unselect', 'toggle'}
function image_grid_update_img_select(img_index, state) {
  var html_img_id = image_grid_get_html_img_id(img_index);
  var is_selected = ( _via_image_grid_selected_img_index_list.indexOf(img_index) !== -1 );
  if (state === 'toggle' ) {
    if ( is_selected ) {
      state = 'unselect';
    } else {
      state = 'select';
    }
  }

  switch(state) {
  case 'select':
    if ( ! is_selected ) {
      _via_image_grid_selected_img_index_list.push(img_index);
    }
    if ( _via_image_grid_visible_img_index_list.indexOf(img_index) !== -1 ) {
      document.getElementById(html_img_id).classList.remove('not_sel');
    }
    break;
  case 'unselect':
    if ( is_selected ) {
      var arr_index = _via_image_grid_selected_img_index_list.indexOf(img_index);
      _via_image_grid_selected_img_index_list.splice(arr_index, 1);
    }
    if ( _via_image_grid_visible_img_index_list.indexOf(img_index) !== -1 ) {
      document.getElementById(html_img_id).classList.add('not_sel');
    }
    break;
  }
}

function image_grid_group_select_all() {
  image_grid_group_set_all_selection_state('select');
  image_grid_update_sel_count_html();
  annotation_editor_update_content();
  show_message('Selected all images in the current group');
}

function image_grid_group_select_none() {
  image_grid_group_set_all_selection_state('unselect');
  image_grid_update_sel_count_html();
  annotation_editor_update_content();
  show_message('Removed selection of all images in the current group');
}

function image_grid_group_set_all_selection_state(state) {
  var i, img_index;
  for ( i = 0; i < _via_image_grid_img_index_list.length; ++i ) {
    img_index = _via_image_grid_img_index_list[i];
    image_grid_update_img_select(img_index, state);
  }
}

function image_grid_group_toggle_select_all() {
  if ( _via_image_grid_selected_img_index_list.length === _via_image_grid_img_index_list.length ) {
    image_grid_group_select_none();
  } else {
    image_grid_group_select_all();
  }
}

function image_grid_parse_html_img_id(html_img_id) {
  var img_index = html_img_id.substr(2);
  return parseInt(img_index);
}

function image_grid_get_html_img_id(img_index) {
  return 'im' + img_index;
}

function image_grid_parse_html_region_id(html_region_id) {
  var chunks = html_region_id.split('_');
  if ( chunks.length === 2 ) {
    var img_index = parseInt(chunks[0].substr(2));
    var region_id = parseInt(chunks[1].substr(2));
    return {'img_index':img_index, 'region_id':region_id};
  } else {
    console.log('image_grid_parse_html_region_id(): invalid html_region_id');
    return {};
  }
}

function image_grid_get_html_region_id(img_index, region_id) {
  return image_grid_get_html_img_id(img_index) + '_rs' + region_id;
}

function image_grid_dblclick_handler(e) {
  _via_image_index = image_grid_parse_html_img_id(e.target.id);
  show_single_image_view();
}

function image_grid_toolbar_update_group_by_select() {
  var p = document.getElementById('image_grid_toolbar_group_by_select');
  p.innerHTML = '';

  var o = document.createElement('option');
  o.setAttribute('value', '');
  o.setAttribute('selected', 'selected');
  o.innerHTML = 'All Images';
  p.appendChild(o);

  // add file attributes
  var fattr;
  for ( fattr in _via_attributes['file'] ) {
    var o = document.createElement('option');
    o.setAttribute('value', image_grid_toolbar_group_by_select_get_html_id('file', fattr));
    o.innerHTML = '[file] ' + fattr;
    p.appendChild(o);
  }

  // add region attributes
  var rattr;
  for ( rattr in _via_attributes['region'] ) {
    var o = document.createElement('option');
    o.setAttribute('value', image_grid_toolbar_group_by_select_get_html_id('region', rattr));
    o.innerHTML = '[region] ' + rattr;
    p.appendChild(o);
  }
}

function image_grid_toolbar_group_by_select_get_html_id(type, name) {
  if ( type === 'file' ) {
    return 'f_' + name;
  }
  if ( type === 'region' ) {
    return 'r_' + name;
  }
}

function image_grid_toolbar_group_by_select_parse_html_id(id) {
  if ( id.startsWith('f_') ) {
    return { 'attr_type':'file', 'attr_name':id.substr(2) };
  }
  if ( id.startsWith('r_') ) {
    return { 'attr_type':'region', 'attr_name':id.substr(2) };
  }
}

function image_grid_toolbar_onchange_group_by_select(p) {
  if ( p.options[p.selectedIndex].value === '' ) {
    image_grid_show_all_project_images();
    return;
  }

  var v = image_grid_toolbar_group_by_select_parse_html_id( p.options[p.selectedIndex].value );
  var attr_type = v.attr_type;
  var attr_name = v.attr_name;
  image_grid_group_by(attr_type, attr_name);

  image_grid_group_by_select_set_disabled(attr_type, attr_name, true);
  p.blur(); // to avoid adding new groups using keyboard keys as dropdown is still in focus
}

function image_grid_remove_html_group_panel(d) {
  var p = document.getElementById('group_toolbar_' + d.group_index);
  document.getElementById('image_grid_group_panel').removeChild(p);
}

function image_grid_add_html_group_panel(d) {
  var p = document.createElement('div');
  p.classList.add('image_grid_group_toolbar');
  p.setAttribute('id', 'group_toolbar_' + d.group_index);

  var del = document.createElement('span');
  del.classList.add('text_button');
  del.setAttribute('onclick', 'image_grid_remove_group_by(this)');
  del.innerHTML = '&times;';
  p.appendChild(del);

  var prev = document.createElement('button');
  prev.innerHTML = '<';
  prev.setAttribute('value', d.group_index);
  prev.setAttribute('onclick', 'image_grid_group_prev(this)');
  p.appendChild(prev);

  var sel = document.createElement('select');
  sel.setAttribute('id', image_grid_group_select_get_html_id(d.group_index));
  sel.setAttribute('onchange', 'image_grid_group_value_onchange(this)');
  var i, value;
  var n = d.values.length;
  var current_value = d.values[ d.current_value_index ];
  for ( i = 0; i < n; ++i ) {
    value = d.values[i];
    var o = document.createElement('option');
    o.setAttribute('value', value);
    o.innerHTML = (i+1) + '/' + n + ': ' + d.name + ' = ' + value;
    if ( value === current_value ) {
      o.setAttribute('selected', 'selected');
    }

    sel.appendChild(o);
  }
  p.appendChild(sel);

  var next = document.createElement('button');
  next.innerHTML = '>';
  next.setAttribute('value', d.group_index);
  next.setAttribute('onclick', 'image_grid_group_next(this)');
  p.appendChild(next);

  document.getElementById('image_grid_group_panel').appendChild(p);
}

function image_grid_group_panel_set_selected_value(group_index) {
  var sel = document.getElementById(image_grid_group_select_get_html_id(group_index));
  sel.selectedIndex = _via_image_grid_group_var[group_index].current_value_index;
}

function image_grid_group_panel_set_options(group_index) {
  var sel = document.getElementById(image_grid_group_select_get_html_id(group_index));
  sel.innerHTML = '';

  var i, value;
  var n = _via_image_grid_group_var[group_index].values.length;
  var name = _via_image_grid_group_var[group_index].name;
  var current_value = _via_image_grid_group_var[group_index].values[ _via_image_grid_group_var[group_index].current_value_index ]
  for ( i = 0; i < n; ++i ) {
    value = _via_image_grid_group_var[group_index].values[i];
    var o = document.createElement('option');
    o.setAttribute('value', value);
    o.innerHTML = (i+1) + '/' + n + ': ' + name + ' = ' + value;
    if ( value === current_value ) {
      o.setAttribute('selected', 'selected');
    }
    sel.appendChild(o);
  }
}

function image_grid_group_select_get_html_id(group_index) {
  return 'gi_' + group_index;
}

function image_grid_group_select_parse_html_id(id) {
  return parseInt(id.substr(3));
}

function image_grid_group_by_select_set_disabled(type, name, is_disabled) {
  var p = document.getElementById('image_grid_toolbar_group_by_select');
  var sel_option_value = image_grid_toolbar_group_by_select_get_html_id(type, name);

  var n = p.options.length;
  var option_value;
  var i;
  for ( i = 0; i < n; ++i ) {
    if ( sel_option_value === p.options[i].value ) {
      if ( is_disabled ) {
        p.options[i].setAttribute('disabled', 'disabled');
      } else {
        p.options[i].removeAttribute('disabled');
      }
      break;
    }
  }
}

function image_grid_remove_group_by(p) {
  var prefix = 'group_toolbar_';
  var group_index = parseInt( p.parentNode.id.substr( prefix.length ) );

  if ( group_index === 0 ) {
    image_grid_show_all_project_images();
  } else {
    // merge all groups that are child of group_index
    image_grid_group_by_merge(_via_image_grid_group, 0, group_index);

    var n = _via_image_grid_group_var.length;
    var p = document.getElementById('image_grid_group_panel');
    var group_panel_id;
    var i;
    for ( i = group_index; i < n; ++i ) {
      image_grid_remove_html_group_panel( _via_image_grid_group_var[i] );
      image_grid_group_by_select_set_disabled( _via_image_grid_group_var[i].type,
                                               _via_image_grid_group_var[i].name,
                                               false);
    }
    _via_image_grid_group_var.splice(group_index);

    image_grid_set_content_to_current_group();
  }
}

function image_grid_group_by(type, name) {
  if ( Object.keys(_via_image_grid_group).length === 0 ) {
    // first group
    var img_index_array = [];
    var n = _via_img_fn_list_img_index_list.length;
    var i;
    for ( i = 0; i < n; ++i ) {
      img_index_array.push( _via_img_fn_list_img_index_list[i] );
    }

    _via_image_grid_group = image_grid_split_array_to_group(img_index_array, type, name);
    var new_group_values = Object.keys(_via_image_grid_group);
    _via_image_grid_group_var = [];
    _via_image_grid_group_var.push( { 'type':type, 'name':name, 'current_value_index':0, 'values':new_group_values, 'group_index':0 } );

    image_grid_add_html_group_panel(_via_image_grid_group_var[0]);
  } else {
    image_grid_group_split_all_arrays( _via_image_grid_group, type, name );

    var i, n, value;
    var current_group_value = _via_image_grid_group;
    n = _via_image_grid_group_var.length;

    for ( i = 0; i < n; ++i ) {
      value = _via_image_grid_group_var[i].values[ _via_image_grid_group_var[i].current_value_index ];
      current_group_value = current_group_value[ value ];
    }
    var new_group_values = Object.keys(current_group_value);
    var group_var_index = _via_image_grid_group_var.length;
    _via_image_grid_group_var.push( { 'type':type, 'name':name, 'current_value_index':0, 'values':new_group_values, 'group_index':group_var_index } );
    image_grid_add_html_group_panel( _via_image_grid_group_var[group_var_index] );
  }

  image_grid_set_content_to_current_group();
}

function image_grid_group_by_merge(group, current_level, target_level) {
  var child_value;
  var group_data = [];
  if ( current_level === target_level ) {
    return image_grid_group_by_collapse(group);
  } else {
    for ( child_value in group ) {
      group[child_value] = image_grid_group_by_merge(group[child_value], current_level + 1, target_level);
    }
  }
}

function image_grid_group_by_collapse(group) {
  var child_value;
  var child_collapsed_value;
  var group_data = [];
  for ( child_value in group ) {
    if ( Array.isArray(group[child_value]) ) {
      group_data = group_data.concat(group[child_value]);
    } else {
      group_data = group_data.concat(image_grid_group_by_collapse(group[child_value]));
    }
  }
  return group_data;
}

// recursively collapse all arrays to list
function image_grid_group_split_all_arrays(group, type, name) {
  if ( Array.isArray(group) ) {
    return image_grid_split_array_to_group(group, type, name);
  } else {
    var group_value;
    for ( group_value in group ) {
      if ( Array.isArray( group[group_value] ) ) {
        group[group_value] = image_grid_split_array_to_group(group[group_value], type, name);
      } else {
        image_grid_group_split_all_arrays(group[group_value], type, name);
      }
    }
  }
}

function image_grid_split_array_to_group(img_index_array, attr_type, attr_name) {
  var grp = {};
  var img_index, img_id, i;
  var n = img_index_array.length;
  var attr_value;

  switch(attr_type) {
  case 'file':
    for ( i = 0; i < n; ++i ) {
      img_index = img_index_array[i];
      img_id = _via_image_id_list[img_index];
      if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty(attr_name) ) {
        attr_value = _via_img_metadata[img_id].file_attributes[attr_name];

        if ( ! grp.hasOwnProperty(attr_value) ) {
          grp[attr_value] = [];
        }
        grp[attr_value].push(img_index);
      }
    }
    break;
  case 'region':
    var j;
    var region_count;
    for ( i = 0; i < n; ++i ) {
      img_index    = img_index_array[i];
      img_id       = _via_image_id_list[img_index];
      region_count = _via_img_metadata[img_id].regions.length;
      for ( j = 0; j < region_count; ++j ) {
        if ( _via_img_metadata[img_id].regions[j].region_attributes.hasOwnProperty(attr_name) ) {
          attr_value = _via_img_metadata[img_id].regions[j].region_attributes[attr_name];

          if ( ! grp.hasOwnProperty(attr_value) ) {
            grp[attr_value] = [];
          }
          if ( grp[attr_value].includes(img_index) ) {
            continue;
          } else {
            grp[attr_value].push(img_index);
          }
        }
      }
    }
    break;
  }
  return grp;
}

function image_grid_group_next(p) {
  var group_index = parseInt( p.value );
  var group_value_list = _via_image_grid_group_var[group_index].values;
  var n = group_value_list.length;
  var current_index = _via_image_grid_group_var[group_index].current_value_index;
  var next_index = current_index + 1;
  if ( next_index >= n ) {
    if ( group_index === 0 ) {
      next_index = next_index - n;
      image_grid_jump_to_group(group_index, next_index);
    } else {
      // next of parent group
      var parent_group_index = group_index - 1;
      var parent_current_val_index = _via_image_grid_group_var[parent_group_index].current_value_index;
      var parent_next_val_index = parent_current_val_index + 1;
      while ( parent_group_index !== 0 ) {
        if ( parent_next_val_index >= _via_image_grid_group_var[parent_group_index].values.length ) {
          parent_group_index = group_index - 1;
          parent_current_val_index = _via_image_grid_group_var[parent_group_index].current_value_index;
          parent_next_val_index = parent_current_val_index + 1;
        } else {
          break;
        }
      }

      if ( parent_next_val_index >= _via_image_grid_group_var[parent_group_index].values.length ) {
        parent_next_val_index = 0;
      }
      image_grid_jump_to_group(parent_group_index, parent_next_val_index);
    }
  } else {
    image_grid_jump_to_group(group_index, next_index);
  }
  image_grid_set_content_to_current_group();
}

function image_grid_group_prev(p) {
  var group_index = parseInt( p.value );
  var group_value_list = _via_image_grid_group_var[group_index].values;
  var n = group_value_list.length;
  var current_index = _via_image_grid_group_var[group_index].current_value_index;
  var prev_index = current_index - 1;
  if ( prev_index < 0 ) {
    if ( group_index === 0 ) {
      prev_index = n + prev_index;
      image_grid_jump_to_group(group_index, prev_index);
    } else {
      // prev of parent group
      var parent_group_index = group_index - 1;
      var parent_current_val_index = _via_image_grid_group_var[parent_group_index].current_value_index;
      var parent_prev_val_index = parent_current_val_index - 1;
      while ( parent_group_index !== 0 ) {
        if ( parent_prev_val_index < 0 ) {
          parent_group_index = group_index - 1;
          parent_current_val_index = _via_image_grid_group_var[parent_group_index].current_value_index;
          parent_prev_val_index = parent_current_val_index - 1;
        } else {
          break;
        }
      }

      if ( parent_prev_val_index < 0 ) {
        parent_prev_val_index = _via_image_grid_group_var[parent_group_index].values.length - 1;
      }
      image_grid_jump_to_group(parent_group_index, parent_prev_val_index);
    }
  } else {
    image_grid_jump_to_group(group_index, prev_index);
  }
  image_grid_set_content_to_current_group();
}


function image_grid_group_value_onchange(p) {
  var group_index = image_grid_group_select_parse_html_id(p.id);
  image_grid_jump_to_group(group_index, p.selectedIndex);
  image_grid_set_content_to_current_group();
}

function image_grid_jump_to_group(group_index, value_index) {
  var n = _via_image_grid_group_var[group_index].values.length;
  if ( value_index >=n || value_index < 0 ) {
    return;
  }

  _via_image_grid_group_var[group_index].current_value_index = value_index;
  image_grid_group_panel_set_selected_value( group_index );

  // reset the value of lower groups
  var i, value;
  if ( group_index + 1 < _via_image_grid_group_var.length ) {
    var e = _via_image_grid_group;
    for ( i = 0; i <= group_index; ++i ) {
      value = _via_image_grid_group_var[i].values[ _via_image_grid_group_var[i].current_value_index ];
      e = e[ value ];
    }

    for ( i = group_index + 1; i < _via_image_grid_group_var.length; ++i ) {
      _via_image_grid_group_var[i].values = Object.keys(e);
      if ( _via_image_grid_group_var[i].values.length === 0 ) {
        _via_image_grid_group_var[i].current_value_index = -1;
        _via_image_grid_group_var.splice(i);
        image_grid_group_panel_set_options(i);
        break;
      } else {
        _via_image_grid_group_var[i].current_value_index = 0;
        value = _via_image_grid_group_var[i].values[0]
        e = e[value];
        image_grid_group_panel_set_options(i);
      }
    }
  }
}

function image_grid_set_content_to_current_group() {
  var n = _via_image_grid_group_var.length;

  if ( n === 0 ) {
    image_grid_show_all_project_images();
  } else {
    var group_img_index_list = [];
    var img_index_list = _via_image_grid_group;
    var i, n, value, current_value_index;
    for ( i = 0; i < n; ++i ) {
      value = _via_image_grid_group_var[i].values[ _via_image_grid_group_var[i].current_value_index ];
      img_index_list = img_index_list[ value ];
    }

    if ( Array.isArray(img_index_list) ) {
      image_grid_set_content(img_index_list);
    } else {
      console.log('Error: image_grid_set_content_to_current_group(): expected array while got ' + typeof(img_index_list));
    }
  }
}

function image_grid_page_next() {
  _via_image_grid_stack_prev_page.push(_via_image_grid_page_first_index);
  _via_image_grid_page_first_index = _via_image_grid_page_last_index;

  image_grid_clear_content();
  _via_image_grid_load_ongoing = true;
  image_grid_page_nav_show_cancel();
  image_grid_content_append_img( _via_image_grid_page_first_index );
}

function image_grid_page_prev() {
  _via_image_grid_page_first_index = _via_image_grid_stack_prev_page.pop();
  _via_image_grid_page_last_index = -1;

  image_grid_clear_content();
  _via_image_grid_load_ongoing = true;
  image_grid_page_nav_show_cancel();
  image_grid_content_append_img( _via_image_grid_page_first_index );
}

function image_grid_page_nav_show_cancel() {
  var info = document.getElementById('image_grid_nav');
  var html = [];
  html.push('<span>Loading images ... </span>');
  html.push('<span class="text_button" onclick="image_grid_cancel_load_ongoing()">Cancel</span>');
  info.innerHTML = html.join('');
}

function image_grid_cancel_load_ongoing() {
  _via_image_grid_load_ongoing = false;
}


// everything to do with image zooming
function image_zoom_init() {

}

//
// hooks for sub-modules
// implemented by sub-modules
//
//function _via_hook_next_image() {}
//function _via_hook_prev_image() {}


////////////////////////////////////////////////////////////////////////////////
//
// Code borrowed from via2 branch
// - in future, the <canvas> based reigon shape drawing will be replaced by <svg>
//   because svg allows independent manipulation of individual regions without
//   requiring to clear the canvas every time some region is updated.
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//
// @file        _via_region.js
// @description Implementation of region shapes like rectangle, circle, etc.
// @author      Abhishek Dutta <adutta@robots.ox.ac.uk>
// @date        17 June 2017
//
////////////////////////////////////////////////////////////////////////////////

function _via_region( shape, id, data_img_space, view_scale_factor, view_offset_x, view_offset_y) {
  // Note the following terminology:
  //   view space  :
  //     - corresponds to the x-y plane on which the scaled version of original image is shown to the user
  //     - all the region query operations like is_inside(), is_on_edge(), etc are performed in view space
  //     - all svg draw operations like get_svg() are also in view space
  //
  //   image space :
  //     - corresponds to the x-y plane which corresponds to the spatial space of the original image
  //     - region save, export, git push operations are performed in image space
  //     - to avoid any rounding issues (caused by floating scale factor),
  //        * user drawn regions in view space is first converted to image space
  //        * this region in image space is now used to initialize region in view space
  //
  //   The two spaces are related by _via_model.now.tform.scale which is computed by the method
  //     _via_ctrl.compute_view_panel_to_nowfile_tform()
  //   and applied as follows:
  //     x coordinate in image space = scale_factor * x coordinate in view space
  //
  // shape : {rect, circle, ellipse, line, polyline, polygon, point}
  // id    : unique region-id
  // d[]   : (in view space) data whose meaning depend on region shape as follows:
  //        rect     : d[x1,y1,x2,y2] or d[corner1_x, corner1_y, corner2_x, corner2_y]
  //        circle   : d[x1,y1,x2,y2] or d[center_x, center_y, circumference_x, circumference_y]
  //        ellipse  : d[x1,y1,x2,y2,transform]
  //        line     : d[x1,y1,x2,y2]
  //        polyline : d[x1,y1,...,xn,yn]
  //        polygon  : d[x1,y1,...,xn,yn]
  //        point    : d[cx,cy]
  // scale_factor : for conversion from view space to image space
  //
  // Note: no svg data are stored with prefix "_". For example: _scale_factor, _x2
  this.shape  = shape;
  this.id     = id;
  this.scale_factor     = view_scale_factor;
  this.offset_x         = view_offset_x;
  this.offset_y         = view_offset_y;
  this.recompute_svg    = false;
  this.attributes  = {};

  var n = data_img_space.length;
  var i;
  this.dview  = new Array(n);
  this.dimg   = new Array(n);

  if ( n !== 0 ) {
    // IMPORTANT:
    // to avoid any rounding issues (caused by floating scale factor), we stick to
    // the principal that image space coordinates are the ground truth for every region.
    // Hence, we proceed as:
    //   * user drawn regions in view space is first converted to image space
    //   * this region in image space is now used to initialize region in view space
    for ( i = 0; i < n; i++ ) {
      this.dimg[i]  = data_img_space[i];

      var offset = this.offset_x;
      if ( i % 2 !== 0 ) {
        // y coordinate
        offset = this.offset_y;
      }
      this.dview[i] = Math.round( this.dimg[i] * this.scale_factor ) + offset;
    }
  }

  // set svg attributes for each shape
  switch( this.shape ) {
  case "rect":
    _via_region_rect.call( this );
    this.svg_attributes = ['x', 'y', 'width', 'height'];
    break;
  case "circle":
    _via_region_circle.call( this );
    this.svg_attributes = ['cx', 'cy', 'r'];
    break;
  case "ellipse":
    _via_region_ellipse.call( this );
    this.svg_attributes = ['cx', 'cy', 'rx', 'ry','transform'];
    break;
  case "line":
    _via_region_line.call( this );
    this.svg_attributes = ['x1', 'y1', 'x2', 'y2'];
    break;
  case "polyline":
    _via_region_polyline.call( this );
    this.svg_attributes = ['points'];
    break;
  case "polygon":
    _via_region_polygon.call( this );
    this.svg_attributes = ['points'];
    break;
  case "point":
    _via_region_point.call( this );
    // point is a special circle with minimal radius required for visualization
    this.shape = 'circle';
    this.svg_attributes = ['cx', 'cy', 'r'];
    break;
  }

  this.initialize();
}


_via_region.prototype.prepare_svg_element = function() {
  var _VIA_SVG_NS = "http://www.w3.org/2000/svg";
  this.svg_element = document.createElementNS(_VIA_SVG_NS, this.shape);
  this.svg_string  = '<' + this.shape;
  this.svg_element.setAttributeNS(null, 'id', this.id);

  var n = this.svg_attributes.length;
  for ( var i = 0; i < n; i++ ) {
    this.svg_element.setAttributeNS(null, this.svg_attributes[i], this[this.svg_attributes[i]]);
    this.svg_string += ' ' + this.svg_attributes[i] + '="' + this[this.svg_attributes[i]] + '"';
  }
  this.svg_string  += '/>';
}

_via_region.prototype.get_svg_element = function() {
  if ( this.recompute_svg ) {
    this.prepare_svg_element();
    this.recompute_svg = false;
  }
  return this.svg_element;
}

_via_region.prototype.get_svg_string = function() {
  if ( this.recompute_svg ) {
    this.prepare_svg_element();
    this.recompute_svg = false;
  }
  return this.svg_string;
}

///
/// Region shape : rectangle
///
function _via_region_rect() {
  this.is_inside  = _via_region_rect.prototype.is_inside;
  this.is_on_edge = _via_region_rect.prototype.is_on_edge;
  this.move  = _via_region_rect.prototype.move;
  this.resize  = _via_region_rect.prototype.resize;
  this.initialize = _via_region_rect.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_rect.prototype.dist_to_nearest_edge;
}

_via_region_rect.prototype.initialize = function() {
  // ensure that this.(x,y) corresponds to top-left corner of rectangle
  // Note: this.(x2,y2) is defined for convenience in calculations
  if ( this.dview[0] < this.dview[2] ) {
    this.x  = this.dview[0];
    this.x2 = this.dview[2];
  } else {
    this.x  = this.dview[2];
    this.x2 = this.dview[0];
  }
  if ( this.dview[1] < this.dview[3] ) {
    this.y  = this.dview[1];
    this.y2 = this.dview[3];
  } else {
    this.y  = this.dview[3];
    this.y2 = this.dview[1];
  }
  this.width  = this.x2 - this.x;
  this.height = this.y2 - this.y;
  this.recompute_svg = true;
}

///
/// Region shape : circle
///
function _via_region_circle() {
  this.is_inside  = _via_region_circle.prototype.is_inside;
  this.is_on_edge = _via_region_circle.prototype.is_on_edge;
  this.move       = _via_region_circle.prototype.move;
  this.resize     = _via_region_circle.prototype.resize;
  this.initialize = _via_region_circle.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_circle.prototype.dist_to_nearest_edge;
}

_via_region_circle.prototype.initialize = function() {
  this.cx = this.dview[0];
  this.cy = this.dview[1];
  var dx = this.dview[2] - this.dview[0];
  var dy = this.dview[3] - this.dview[1];
  this.r  = Math.round( Math.sqrt(dx * dx + dy * dy) );
  this.r2 = this.r * this.r;
  this.recompute_svg = true;
}


///
/// Region shape : ellipse
///
function _via_region_ellipse() {
  this.is_inside  = _via_region_ellipse.prototype.is_inside;
  this.is_on_edge = _via_region_ellipse.prototype.is_on_edge;
  this.move  = _via_region_ellipse.prototype.move;
  this.resize  = _via_region_ellipse.prototype.resize;
  this.initialize = _via_region_ellipse.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_ellipse.prototype.dist_to_nearest_edge;
}

_via_region_ellipse.prototype.initialize = function() {
  this.cx = this.dview[0];
  this.cy = this.dview[1];
  this.rx = Math.abs(this.dview[2] - this.dview[0]);
  this.ry = Math.abs(this.dview[3] - this.dview[1]);

  this.inv_rx2 = 1 / (this.rx * this.rx);
  this.inv_ry2 = 1 / (this.ry * this.ry);

  this.recompute_svg = true;
}



///
/// Region shape : line
///
function _via_region_line() {
  this.is_inside  = _via_region_line.prototype.is_inside;
  this.is_on_edge = _via_region_line.prototype.is_on_edge;
  this.move  = _via_region_line.prototype.move;
  this.resize  = _via_region_line.prototype.resize;
  this.initialize = _via_region_line.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_line.prototype.dist_to_nearest_edge;
}

_via_region_line.prototype.initialize = function() {
  this.x1 = this.dview[0];
  this.y1 = this.dview[1];
  this.x2 = this.dview[2];
  this.y2 = this.dview[3];
  this.dx = this.x1 - this.x2;
  this.dy = this.y1 - this.y2;
  this.mconst = (this.x1 * this.y2) - (this.x2 * this.y1);

  this.recompute_svg = true;
}


///
/// Region shape : polyline
///
function _via_region_polyline() {
  this.is_inside  = _via_region_polyline.prototype.is_inside;
  this.is_on_edge = _via_region_polyline.prototype.is_on_edge;
  this.move  = _via_region_polyline.prototype.move;
  this.resize  = _via_region_polyline.prototype.resize;
  this.initialize = _via_region_polyline.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_polyline.prototype.dist_to_nearest_edge;
}

_via_region_polyline.prototype.initialize = function() {
  var n = this.dview.length;
  var points = new Array(n/2);
  var points_index = 0;
  for ( var i = 0; i < n; i += 2 ) {
    points[points_index] = ( this.dview[i] + ' ' + this.dview[i+1] );
    points_index++;
  }
  this.points = points.join(',');
  this.recompute_svg = true;
}


///
/// Region shape : polygon
///
function _via_region_polygon() {
  this.is_inside  = _via_region_polygon.prototype.is_inside;
  this.is_on_edge = _via_region_polygon.prototype.is_on_edge;
  this.move  = _via_region_polygon.prototype.move;
  this.resize  = _via_region_polygon.prototype.resize;
  this.initialize = _via_region_polygon.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_polygon.prototype.dist_to_nearest_edge;
}

_via_region_polygon.prototype.initialize = function() {
  var n = this.dview.length;
  var points = new Array(n/2);
  var points_index = 0;
  for ( var i = 0; i < n; i += 2 ) {
    points[points_index] = ( this.dview[i] + ' ' + this.dview[i+1] );
    points_index++;
  }
  this.points = points.join(',');
  this.recompute_svg = true;
}


///
/// Region shape : point
///
function _via_region_point() {
  this.is_inside  = _via_region_point.prototype.is_inside;
  this.is_on_edge = _via_region_point.prototype.is_on_edge;
  this.move  = _via_region_point.prototype.move;
  this.resize  = _via_region_point.prototype.resize
  this.initialize  = _via_region_point.prototype.initialize;
  this.dist_to_nearest_edge = _via_region_point.prototype.dist_to_nearest_edge;
}

_via_region_point.prototype.initialize = function() {
  this.cx = this.dview[0];
  this.cy = this.dview[1];
  this.r  = 2;
  this.r2 = this.r * this.r;
  this.recompute_svg = true;
}

//
// image buffering
//

function _via_cancel_current_image_loading() {
  var panel = document.getElementById('project_panel_title');
  panel.innerHTML = 'Project';
  _via_is_loading_current_image = false;
}

function _via_show_img(img_index) {
  if ( _via_is_loading_current_image ) {
    return;
  }

  if ( !_via_finish_polyshape_on_image_switch(img_index) ) {
    return;
  }

  var img_id = _via_image_id_list[img_index];

  if ( ! _via_img_metadata.hasOwnProperty(img_id) ) {
    console.log('_via_show_img(): [' + img_index + '] ' + img_id + ' does not exist!')
    show_message('The requested image does not exist!')
    return;
  }

  // file_resolve() is not necessary for files selected using browser's file selector
  if ( typeof(_via_img_fileref[img_id]) === 'undefined' || ! _via_img_fileref[img_id] instanceof File ) {
    // try preload from local file or url
    if ( typeof(_via_img_src[img_id]) === 'undefined' || _via_img_src[img_id] === '' ) {
      if ( is_url( _via_img_metadata[img_id].filename ) ) {
        _via_img_src[img_id] = _via_img_metadata[img_id].filename;
        _via_show_img(img_index);
        return;
      } else {
        var search_path_list = _via_file_get_search_path_list();
        if ( search_path_list.length === 0 ) {
          search_path_list.push(''); // search using just the filename
        }

        _via_file_resolve(img_index, search_path_list).then( function(ok_file_index) {
          _via_show_img(img_index);
        }, function(err_file_index) {
          show_page_404(img_index);
        });
        return;
      }
    }
  }

  if ( _via_buffer_img_index_list.includes(img_index) ) {
    _via_current_image_loaded = false;
    _via_show_img_from_buffer(img_index).then( function(ok_img_index) {
      // trigger preload of images in buffer corresponding to img_index
      // but, wait until all previous promises get cancelled
      Promise.all(_via_preload_img_promise_list).then( function(values) {
        _via_preload_img_promise_list = [];
        var preload_promise = _via_img_buffer_start_preload( img_index, 0 )
        _via_preload_img_promise_list.push(preload_promise);
      });
    }, function(err_img_index) {
      console.log('_via_show_img_from_buffer() failed for file: ' + _via_image_filename_list[err_img_index]);
      _via_current_image_loaded = false;
    });
  } else {
    // image not in buffer, so first add this image to buffer
    _via_is_loading_current_image = true;
    img_loading_spinbar(img_index, true);
    _via_img_buffer_add_image(img_index).then( function(ok_img_index) {
      _via_is_loading_current_image = false;
      img_loading_spinbar(img_index, false);
      _via_show_img(img_index);
    }, function(err_img_index) {
      _via_is_loading_current_image = false;
      img_loading_spinbar(img_index, false);
      show_page_404(img_index);
      console.log('_via_img_buffer_add_image() failed for file: ' + _via_image_filename_list[err_img_index]);
    });
  }
}

function _via_buffer_hide_current_image() {
  img_fn_list_ith_entry_selected(_via_image_index, false);
  _via_clear_reg_canvas(); // clear old region shapes
  if ( _via_current_image ) {
    _via_current_image.classList.remove('visible');
  }
}

function _via_show_img_from_buffer(img_index) {
  return new Promise( function(ok_callback, err_callback) {
    // Auto-save mask when switching to a different image
    // Note: _via_current_image_loaded is already set to false before this function
    // is called, so we check _via_image_id directly instead.
    if (_via_mask_mode && _via_image_id &&
        _via_image_id !== _via_image_id_list[img_index]) {
      mask_autosave_current(_via_image_id);
    }

    _via_buffer_hide_current_image();

    var cimg_html_id = _via_img_buffer_get_html_id(img_index);
    _via_current_image = document.getElementById(cimg_html_id);
    if ( ! _via_current_image ) {
      // the said image is not present in buffer, which could be because
      // the image got removed from the buffer
      err_callback(img_index);
      return;
    }
    _via_current_image.classList.add('visible'); // now show the new image

    _via_image_index = img_index;
    _via_image_id    = _via_image_id_list[_via_image_index];
    _via_current_image_filename = _via_img_metadata[_via_image_id].filename;
    _via_current_image_loaded = true;

    var arr_index = _via_buffer_img_index_list.indexOf(img_index);
    _via_buffer_img_shown_timestamp[arr_index] = Date.now(); // update shown timestamp

    // update the current state of application
    _via_click_x0 = 0; _via_click_y0 = 0;
    _via_click_x1 = 0; _via_click_y1 = 0;
    _via_is_user_drawing_region = false;
    _via_is_window_resized = false;
    _via_is_user_resizing_region = false;
    _via_is_user_moving_region = false;
    _via_is_user_drawing_polygon = false;
    _via_is_region_selected = false;
    _via_user_sel_region_id = -1;
    _via_current_image_width = _via_current_image.naturalWidth;
    _via_current_image_height = _via_current_image.naturalHeight;

    if ( _via_current_image_width === 0 || _via_current_image_height === 0 ) {
      // for error image icon
      _via_current_image_width = 640;
      _via_current_image_height = 480;
    }

    // set the size of canvas
    // based on the current dimension of browser window
    var de = document.documentElement;
    var image_panel_width = de.clientWidth - leftsidebar.clientWidth - 20;
    if ( leftsidebar.style.display === 'none' ) {
      image_panel_width = de.clientWidth;
    }
    var image_panel_height = de.clientHeight - 2*ui_top_panel.offsetHeight;

    _via_canvas_width = _via_current_image_width;
    _via_canvas_height = _via_current_image_height;

    if ( _via_canvas_width > image_panel_width ) {
      // resize image to match the panel width
      var scale_width = image_panel_width / _via_current_image.naturalWidth;
      _via_canvas_width = image_panel_width;
      _via_canvas_height = _via_current_image.naturalHeight * scale_width;
    }
    if ( _via_canvas_height > image_panel_height ) {
      // resize further image if its height is larger than the image panel
      var scale_height = image_panel_height / _via_canvas_height;
      _via_canvas_height = image_panel_height;
      _via_canvas_width = _via_canvas_width * scale_height;
    }
    _via_canvas_width = Math.round(_via_canvas_width);
    _via_canvas_height = Math.round(_via_canvas_height);
    _via_canvas_scale = _via_current_image.naturalWidth / _via_canvas_width;
    _via_canvas_scale_without_zoom = _via_canvas_scale;
    set_all_canvas_size(_via_canvas_width, _via_canvas_height);
    //set_all_canvas_scale(_via_canvas_scale_without_zoom);

    // reset all regions to "not selected" state
    toggle_all_regions_selection(false);

    // ensure that all the canvas are visible
    set_display_area_content( VIA_DISPLAY_AREA_CONTENT_NAME.IMAGE );

    // update img_fn_list
    img_fn_list_ith_entry_selected(_via_image_index, true);
    img_fn_list_scroll_to_current_file();

    // refresh the annotations panel
    annotation_editor_update_content();

    _via_load_canvas_regions(); // image to canvas space transform
    _via_redraw_reg_canvas();
    _via_reg_canvas.focus();

    // Restore mask for the newly shown image
    if (typeof mask_restore_for_image === 'function') {
      mask_resize_canvas();
      mask_restore_for_image(_via_image_id);
    }

    // Preserve zoom level
    if (_via_is_canvas_zoomed) {
      set_zoom( _via_canvas_zoom_level_index );
    }
    ok_callback(img_index);
  });
}

function _via_img_buffer_add_image(img_index) {
  return new Promise( function(ok_callback, err_callback) {
    if ( _via_buffer_img_index_list.includes(img_index) ) {
      //console.log('_via_img_buffer_add_image(): image ' + img_index + ' already exists in buffer!')
      ok_callback(img_index);
      return;
    }

    var img_id = _via_image_id_list[img_index];
    var img_filename = _via_img_metadata[img_id].filename;
    if ( !_via_img_metadata.hasOwnProperty(img_id)) {
      err_callback(img_index);
      return;
    }

    // check if user has given access to local file using
    // browser's file selector
    if ( _via_img_fileref[img_id] instanceof File ) {
      var tmp_file_object_url = URL.createObjectURL(_via_img_fileref[img_id]);
      var img_id = _via_image_id_list[img_index];
      var bimg = document.createElement('img');
      bimg.setAttribute('id', _via_img_buffer_get_html_id(img_index));
      bimg.setAttribute('src', tmp_file_object_url);
      bimg.setAttribute('alt', 'Image loaded from base64 data of a local file selected by user.');
      bimg.addEventListener('error', function() {
        URL.revokeObjectURL(tmp_file_object_url);
        project_file_load_on_fail(img_index);
        err_callback(img_index);
      });
      bimg.addEventListener('load', function() {
        URL.revokeObjectURL(tmp_file_object_url);
        img_stat_set(img_index, [bimg.naturalWidth, bimg.naturalHeight]);
        _via_img_panel.insertBefore(bimg, _via_reg_canvas);
        project_file_load_on_success(img_index);
        img_fn_list_ith_entry_add_css_class(img_index, 'buffered')
        // add timestamp so that we can apply Least Recently Used (LRU)
        // scheme to remove elements when buffer is full
        var arr_index = _via_buffer_img_index_list.length;
        _via_buffer_img_index_list.push(img_index);
        _via_buffer_img_shown_timestamp[arr_index] = Date.now(); // though, not seen yet
        ok_callback(img_index);
      });
      return;
    }

    if ( typeof(_via_img_src[img_id]) === 'undefined' || _via_img_src[img_id] === '' ) {
      err_callback(img_index);
    } else {
      var img_id = _via_image_id_list[img_index];

      var bimg = document.createElement('img');
      bimg.setAttribute('id', _via_img_buffer_get_html_id(img_index));
      _via_img_src[img_id] = _via_img_src[img_id].replace('#', '%23');
      bimg.setAttribute('src', _via_img_src[img_id]);
      if ( _via_img_src[img_id].startsWith('data:image') ) {
        bimg.setAttribute('alt', 'Source: image data in base64 format');
      } else {
        bimg.setAttribute('alt', 'Source: ' + _via_img_src[img_id]);
      }

      bimg.addEventListener('abort', function() {
        project_file_load_on_fail(img_index);
        err_callback(img_index);
      });
      bimg.addEventListener('error', function() {
        project_file_load_on_fail(img_index);
        err_callback(img_index);
      });

      // Note: _via_current_image.{naturalWidth,naturalHeight} is only accessible after
      // the "load" event. Therefore, all processing must happen inside this event handler.
      bimg.addEventListener('load', function() {
        img_stat_set(img_index, [bimg.naturalWidth, bimg.naturalHeight]);
        _via_img_panel.insertBefore(bimg, _via_reg_canvas);

        project_file_load_on_success(img_index);
        img_fn_list_ith_entry_add_css_class(img_index, 'buffered')
        // add timestamp so that we can apply Least Recently Used (LRU)
        // scheme to remove elements when buffer is full
        var arr_index = _via_buffer_img_index_list.length;
        _via_buffer_img_index_list.push(img_index);
        _via_buffer_img_shown_timestamp[arr_index] = Date.now(); // though, not seen yet
        ok_callback(img_index);
      }, false);
    }
  }, false);
}

function _via_img_buffer_get_html_id(img_index) {
  return 'bim' + img_index;
}

function _via_img_buffer_parse_html_id(html_id) {
  return parseInt( html_id.substr(3) );
}

function _via_img_buffer_start_preload(img_index, preload_index) {
  return new Promise( function(ok_callback, err_callback) {
    _via_buffer_preload_img_index = img_index;
    _via_img_buffer_preload_img(_via_buffer_preload_img_index, 0).then( function(ok_img_index_list) {
      ok_callback(ok_img_index_list);
    });
  });
}

function _via_img_buffer_preload_img(img_index, preload_index) {
  return new Promise( function(ok_callback, err_callback) {
    var preload_img_index = _via_img_buffer_get_preload_img_index(img_index, preload_index);

    if ( _via_buffer_preload_img_index !== _via_image_index ) {
      ok_callback([]);
      return;
    }

    // ensure that there is sufficient buffer space left for preloading image
    if ( _via_buffer_img_index_list.length > _via_settings.core.buffer_size ) {
      while( _via_buffer_img_index_list.length > _via_settings.core.buffer_size ) {
        _via_img_buffer_remove_least_useful_img();
        if ( _via_image_index !== _via_buffer_preload_img_index ) {
          // current image has changed therefore, we need to cancel this preload operation
          ok_callback([]);
          return;
        }
      }
    }

    _via_img_buffer_add_image(preload_img_index).then( function(ok_img_index) {
      if ( _via_image_index !== _via_buffer_preload_img_index ) {
        ok_callback( [ok_img_index] );
        return;
      }

      var next_preload_index = preload_index + 1;
      if ( next_preload_index !== VIA_IMG_PRELOAD_COUNT ) {
        _via_img_buffer_preload_img(img_index, next_preload_index).then( function(ok_img_index_list) {
          ok_img_index_list.push( ok_img_index )
          ok_callback( ok_img_index_list );
        });
      } else {
        ok_callback( [ok_img_index] );
      }
    }, function(err_img_index) {
      // continue with preload of other images in sequence
      var next_preload_index = preload_index + 1;
      if ( next_preload_index !== VIA_IMG_PRELOAD_COUNT ) {
        _via_img_buffer_preload_img(img_index, next_preload_index).then( function(ok_img_index_list) {
          ok_callback( ok_img_index_list );
        });
      } else {
        ok_callback([]);
      }
    });
  });
}

function _via_img_buffer_get_preload_img_index(img_index, preload_index) {
  var preload_img_index = img_index + VIA_IMG_PRELOAD_INDICES[preload_index];
  if ( (preload_img_index < 0) || (preload_img_index >= _via_img_count) ) {
    if ( preload_img_index < 0 ) {
      preload_img_index = _via_img_count + preload_img_index;
    } else {
      preload_img_index = preload_img_index - _via_img_count;
    }
  }
  return preload_img_index;
}

// the least useful image is, one with the following properties:
// - preload list for current image will always get loaded, so there is no point in removing them from buffer
// - all the other images in buffer were seen more recently by the image
// - all the other images are closer (in terms of their image index) to the image currently being shown
function _via_img_buffer_remove_least_useful_img() {
  var not_in_preload_list = _via_buffer_img_not_in_preload_list();
  var oldest_buffer_index = _via_buffer_get_oldest_in_list(not_in_preload_list);

  if ( _via_buffer_img_index_list[oldest_buffer_index] !== _via_image_index ) {
    //console.log('removing oldest_buffer index: ' + oldest_buffer_index);
    _via_buffer_remove(oldest_buffer_index);
  } else {
    var furthest_buffer_index = _via_buffer_get_buffer_furthest_from_current_img();
    _via_buffer_remove(furthest_buffer_index);
  }
}

function _via_buffer_remove( buffer_index ) {
  var img_index = _via_buffer_img_index_list[buffer_index];
  var bimg_html_id = _via_img_buffer_get_html_id(img_index);
  var bimg = document.getElementById(bimg_html_id);
  if ( bimg ) {
    _via_buffer_img_index_list.splice(buffer_index, 1);
    _via_buffer_img_shown_timestamp.splice(buffer_index, 1);
    _via_img_panel.removeChild(bimg);

    img_fn_list_ith_entry_remove_css_class(img_index, 'buffered')
  }
}

function _via_buffer_remove_all() {
  var i, n;
  n = _via_buffer_img_index_list.length;
  for ( i = 0 ; i < n; ++i ) {
    var img_index = _via_buffer_img_index_list[i];
    var bimg_html_id = _via_img_buffer_get_html_id(img_index);
    var bimg = document.getElementById(bimg_html_id);
    if ( bimg ) {
      _via_img_panel.removeChild(bimg);
    }
  }
  _via_buffer_img_index_list = [];
  _via_buffer_img_shown_timestamp = [];
}

function _via_buffer_get_oldest_in_list(not_in_preload_list) {
  var i;
  var n = not_in_preload_list.length;
  var oldest_buffer_index = -1;
  var oldest_buffer_timestamp = Date.now();

  for ( i = 0; i < n; ++i ) {
    var _via_buffer_index = not_in_preload_list[i];
    if ( _via_buffer_img_shown_timestamp[_via_buffer_index] < oldest_buffer_timestamp ) {
      oldest_buffer_timestamp = _via_buffer_img_shown_timestamp[i];
      oldest_buffer_index = i;
    }
  }
  return oldest_buffer_index;
}

function _via_buffer_get_buffer_furthest_from_current_img() {
  var now_img_index = _via_image_index;
  var i, dist1, dist2, dist;
  var n = _via_buffer_img_index_list.length;
  var furthest_buffer_index = 0;
  dist1 = Math.abs( _via_buffer_img_index_list[0] - now_img_index );
  dist2 = _via_img_count - dist1; // assuming the list is circular
  var furthest_buffer_dist = Math.min(dist1, dist2);

  for ( i = 1; i < n; ++i ) {
    dist1 = Math.abs( _via_buffer_img_index_list[i] - now_img_index );
    dist2 = _via_img_count - dist1; // assuming the list is circular
    dist = Math.min(dist1, dist2);
    // image has been seen by user at least once
    if ( dist > furthest_buffer_dist ) {
      furthest_buffer_dist = dist;
      furthest_buffer_index = i;
    }
  }
  return furthest_buffer_index;
}

function _via_buffer_img_not_in_preload_list() {
  var preload_list = _via_buffer_get_current_preload_list();
  var i;
  var not_in_preload_list = [];
  for ( i = 0; i < _via_buffer_img_index_list.length; ++i ) {
    if ( ! preload_list.includes( _via_buffer_img_index_list[i] ) ) {
      not_in_preload_list.push( i );
    }
  }
  return not_in_preload_list;
}

function _via_buffer_get_current_preload_list() {
  var i;
  var preload_list = [_via_image_index];
  var img_index = _via_image_index;
  for ( i = 0; i < VIA_IMG_PRELOAD_COUNT; ++i ) {
    var preload_index = img_index + VIA_IMG_PRELOAD_INDICES[i];
    if ( preload_index < 0 ) {
      preload_index = _via_img_count + preload_index;
    }
    if ( preload_index >= _via_img_count ) {
      preload_index = preload_index - _via_img_count;
    }
    preload_list.push(preload_index);
  }
  return preload_list;
}

//
// settings
//
function settings_panel_toggle() {
  if ( _via_display_area_content_name === VIA_DISPLAY_AREA_CONTENT_NAME.SETTINGS ) {
    if ( _via_display_area_content_name_prev !== '' ) {
      set_display_area_content(_via_display_area_content_name_prev);
    } else {
      show_single_image_view();
      _via_redraw_rleg_canvas();
    }
  }
  else {
    settings_init();
    set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.SETTINGS);
  }
}

function settings_init() {
  settings_region_visualisation_update_options();
  settings_filepath_update_html();
  settings_show_current_value();
}

function settings_save() {
  // check if default path was updated
  var default_path_updated = false;
  if ( document.getElementById('_via_settings.core.default_filepath').value !== _via_settings.core.default_filepath ) {
    default_path_updated = true;
  }

  var p = document.getElementById('settings_panel');
  var vl = p.getElementsByClassName('value');
  var n = vl.length;
  var i;
  for ( i = 0; i < n; ++i ) {
    var s = vl[i].childNodes[1];
    var sid_parts = s.id.split('.');
    if ( sid_parts[0] === '_via_settings' ) {
      var el = _via_settings;
      var found = true;
      var j;
      for ( j = 1; j < sid_parts.length - 1; ++j ) {
        if ( el.hasOwnProperty( sid_parts[j] ) ) {
          el = el[ sid_parts[j] ];
        } else {
          // unrecognized setting
          found = false;
          break;
        }
      }
      if ( found ) {
        var param = sid_parts[ sid_parts.length - 1 ];
        if ( s.value !== '' || typeof(s.value) !== 'undefined' ) {
          el[param] = s.value;
        }
      }
    }
  }

  // non-standard settings
  var p;
  p = document.getElementById('settings_input_new_filepath');
  if ( p.value !== '' ) {
    project_filepath_add(p.value.trim());
  }
  p = document.getElementById('project_name');
  if ( p.value !== _via_settings.project.name ) {
    p.value = _via_settings.project.name;
  }

  if ( default_path_updated ) {
    _via_file_resolve_all_to_default_filepath();
    _via_show_img(_via_image_index);
  }

  show_message('Settings saved.');
  settings_panel_toggle();
}

function settings_show_current_value() {
  var p = document.getElementById('settings_panel');
  var vl = p.getElementsByClassName('value');
  var n = vl.length;
  var i;
  for ( i = 0; i < n; ++i ) {
    var s = vl[i].childNodes[1];
    var sid_parts = s.id.split('.');
    if ( sid_parts[0] === '_via_settings' ) {
      var el = _via_settings;
      var found = true;
      var j;
      for ( j = 1; j < sid_parts.length; ++j ) {
        if ( el.hasOwnProperty( sid_parts[j] ) ) {
          el = el[ sid_parts[j] ];
        } else {
          // unrecognized setting
          found = false;
          break;
        }
      }

      if ( found ) {
        s.value = el;
      }
    }
  }
}

function settings_region_visualisation_update_options() {
  var region_setting_list = {'region_label': {
    'default_option':'__via_region_id__',
    'default_label':'Region id (1, 2, ...)',
    'label_prefix':'Show value of region attribute: ',
  }, 'region_color': {
    'default_option':'__via_default_region_color__',
    'default_label':'Default Region Colour',
    'label_prefix':'Based on value of region attribute: ',
  }};

  for ( var setting in region_setting_list ) {
    var select = document.getElementById('_via_settings.ui.image.' + setting);
    select.innerHTML = '';
    var default_option = document.createElement('option');
    default_option.setAttribute('value', region_setting_list[setting]['default_option']);
    if ( _via_settings.ui.image[setting] === region_setting_list[setting]['default_option'] ) {
      default_option.setAttribute('selected', 'selected');
    }
    default_option.innerHTML = region_setting_list[setting]['default_label'];
    select.appendChild(default_option);

    // options: add region attributes
    var rattr;
    for ( rattr in _via_attributes['region'] ) {
      var o = document.createElement('option');
      o.setAttribute('value', rattr);
      o.innerHTML = region_setting_list[setting]['label_prefix'] + rattr;
      if ( _via_settings.ui.image.region_label === rattr ) {
        o.setAttribute('selected', 'selected');
      }
      select.appendChild(o);
    }
  }
}

function settings_filepath_update_html() {
  var p = document.getElementById('_via_settings.core.filepath');
  p.innerHTML = '';
  var i, path, order;
  for ( path in _via_settings.core.filepath ) {
    order = _via_settings.core.filepath[path]
    if ( order !== 0 ) {
      var li = document.createElement('li');
      li.innerHTML = path + '<span class="text_button" title="Delete image path" onclick="project_filepath_del(\"' + path + '\"); settings_filepath_update_html();">&times;</span>';
      p.appendChild(li);
    }
  }
}

//
// find location of file
//

function _via_file_resolve_all_to_default_filepath() {
  var img_id;
  for ( img_id in _via_img_metadata ) {
    if ( _via_img_metadata.hasOwnProperty(img_id) ) {
      _via_file_resolve_file_to_default_filepath(img_id);
    }
  }
}

function _via_file_resolve_file_to_default_filepath(img_id) {
  if ( _via_img_metadata.hasOwnProperty(img_id) ) {
    if ( typeof(_via_img_fileref[img_id]) === 'undefined' || ! _via_img_fileref[img_id] instanceof File ) {
      if ( is_url( _via_img_metadata[img_id].filename ) ) {
        _via_img_src[img_id] = _via_img_metadata[img_id].filename;
      } else {
        _via_img_src[img_id] = _via_settings.core.default_filepath + _via_img_metadata[img_id].filename;
      }
    }
  }
}

function _via_file_resolve_all() {
  return new Promise( function(ok_callback, err_callback) {
    var all_promises = [];

    var search_path_list = _via_file_get_search_path_list();
    var i, img_id;
    for ( i = 0; i < _via_img_count; ++i ) {
      img_id = _via_image_id_list[i];
      if ( typeof(_via_img_src[img_id]) === 'undefined' || _via_img_src[img_id] === '' ) {
        var p = _via_file_resolve(i, search_path_list);
        all_promises.push(p);
      }
    }

    Promise.all( all_promises ).then( function(ok_file_index_list) {
      console.log(ok_file_index_list);
      ok_callback();
      //project_file_load_on_success(ok_file_index);
    }, function(err_file_index_list) {
      console.log(err_file_index_list);
      err_callback();
      //project_file_load_on_fail(err_file_index);
    });

  });
}

function _via_file_get_search_path_list() {
  var search_path_list = [];
  var path;
  for ( path in _via_settings.core.filepath ) {
    if ( _via_settings.core.filepath[path] !== 0 ) {
      search_path_list.push(path);
    }
  }
  return search_path_list;
}

function _via_file_resolve(file_index, search_path_list) {
  return new Promise( function(ok_callback, err_callback) {
    var path_index = 0;
    var p = _via_file_resolve_check_path(file_index, path_index, search_path_list).then(function(ok) {
      ok_callback(ok);
    }, function(err) {
      err_callback(err);
    });
  }, false);
}

function _via_file_resolve_check_path(file_index, path_index, search_path_list) {
  return new Promise( function(ok_callback, err_callback) {
    var img_id = _via_image_id_list[file_index];
    var img = new Image(0,0);

    var img_path = search_path_list[path_index] + _via_img_metadata[img_id].filename;
    if ( is_url( _via_img_metadata[img_id].filename ) ) {
      if ( search_path_list[path_index] !== '' ) {
        // we search for the the image filename pointed by URL in local search paths
        img_path = search_path_list[path_index] + get_filename_from_url( _via_img_metadata[img_id].filename );
      }
    }

    img.setAttribute('src', img_path);

    img.addEventListener('load', function() {
      _via_img_src[img_id] = img_path;
      ok_callback(file_index);
    }, false);
    img.addEventListener('abort', function() {
      err_callback(file_index);
    });
    img.addEventListener('error', function() {
      var new_path_index = path_index + 1;
      if ( new_path_index < search_path_list.length ) {
        _via_file_resolve_check_path(file_index, new_path_index, search_path_list).then( function(ok) {
          ok_callback(file_index);
        }, function(err) {
          err_callback(file_index);
        });
      } else {
        err_callback(file_index);
      }
    }, false);
  }, false);
}

//
// page 404 (file not found)
//
function show_page_404(img_index) {
  _via_buffer_hide_current_image();

  set_display_area_content(VIA_DISPLAY_AREA_CONTENT_NAME.PAGE_404);

  _via_image_index = img_index;
  _via_image_id = _via_image_id_list[_via_image_index];
  _via_current_image_loaded = false;
  img_fn_list_ith_entry_selected(_via_image_index, true);

  document.getElementById('page_404_filename').innerHTML = '[' + (_via_image_index+1) + ']' + _via_img_metadata[_via_image_id].filename;
}


//
// utils
//

function is_url( s ) {
  // @todo: ensure that this is sufficient to capture all image url
  if ( s.startsWith('http://') || s.startsWith('https://') || s.startsWith('www.') ) {
    return true;
  } else {
    return false;
  }
}

function get_filename_from_url( url ) {
  return url.substring( url.lastIndexOf('/') + 1 );
}

function fixfloat(x) {
  return parseFloat( x.toFixed(VIA_FLOAT_PRECISION) );
}

function shape_attribute_fixfloat(sa) {
  for ( var attr in sa ) {
    switch(attr) {
    case 'x':
    case 'y':
    case 'width':
    case 'height':
    case 'r':
    case 'rx':
    case 'ry':
      sa[attr] = fixfloat( sa[attr] );
      break;
    case 'all_points_x':
    case 'all_points_y':
      for ( var i in sa[attr] ) {
        sa[attr][i] = fixfloat( sa[attr][i] );
      }
    }
  }
}

// start with the array having smallest number of elements
// check the remaining arrays if they all contain the elements of this shortest array
function array_intersect( array_list ) {
  if ( array_list.length === 0 ) {
    return [];
  }
  if ( array_list.length === 1 ) {
    return array_list[0];
  }

  var shortest_array = array_list[0];
  var shortest_array_index = 0;
  var i;
  for ( i = 1; i < array_list.length; ++i ) {
    if ( array_list[i].length < shortest_array.length ) {
      shortest_array = array_list[i];
      shortest_array_index = i;
    }
  }

  var intersect = [];
  var element_count = {};

  var array_index_i;
  for ( i = 0; i < array_list.length; ++i ) {
    if ( i === 0 ) {
      // in the first iteration, process the shortest element array
      array_index_i = shortest_array_index;
    } else {
      array_index_i = i;
    }

    var j;
    for ( j = 0; j < array_list[array_index_i].length; ++j ) {
      if ( element_count[ array_list[array_index_i][j] ] === (i-1) ) {
        if ( i === array_list.length - 1 ) {
          intersect.push( array_list[array_index_i][j] );
          element_count[ array_list[array_index_i][j] ] = 0;
        } else {
          element_count[ array_list[array_index_i][j] ] = i;
        }
      } else {
        element_count[ array_list[array_index_i][j] ] = 0;
      }
    }
  }
  return intersect;
}

function generate_img_index_list(input) {
  var all_img_index_list = [];

  // condition: count format a,b
  var count_format_img_index_list = [];
  if ( input.prev_next_count.value !== '' ) {
    var prev_next_split = input.prev_next_count.value.split(',');
    if ( prev_next_split.length === 2 ) {
      var prev = parseInt( prev_next_split[0] );
      var next = parseInt( prev_next_split[1] );
      var i;
      for ( i = (_via_image_index - prev); i <= (_via_image_index + next); i++ ) {
        count_format_img_index_list.push(i);
      }
    }
  }
  if ( count_format_img_index_list.length !== 0 ) {
    all_img_index_list.push(count_format_img_index_list);
  }

  //condition: image index list expression
  var expr_img_index_list = [];
  if ( input.img_index_list.value !== '' ) {
    var img_index_expr = input.img_index_list.value.split(',');
    if ( img_index_expr.length !== 0 ) {
      var i;
      for ( i = 0; i < img_index_expr.length; ++i ) {
        if ( img_index_expr[i].includes('-') ) {
          var ab = img_index_expr[i].split('-');
          var a = parseInt( ab[0] ) - 1; // 0 based indexing
          var b = parseInt( ab[1] ) - 1;
          var j;
          for ( j = a; j <= b; ++j ) {
            expr_img_index_list.push(j);
          }
        } else {
          expr_img_index_list.push( parseInt(img_index_expr[i]) - 1 );
        }
      }
    }
  }
  if ( expr_img_index_list.length !== 0 ) {
    all_img_index_list.push(expr_img_index_list);
  }


  // condition: regular expression
  var regex_img_index_list = [];
  if ( input.regex.value !== '' ) {
    var regex = input.regex.value;
    for ( var i=0; i < _via_image_filename_list.length; ++i ) {
      var filename = _via_image_filename_list[i];
      if ( filename.match(regex) !== null ) {
        regex_img_index_list.push(i);
      }
    }
  }
  if ( regex_img_index_list.length !== 0 ) {
    all_img_index_list.push(regex_img_index_list);
  }

  var intersect = array_intersect(all_img_index_list);
  return intersect;
}

if ( ! _via_is_debug_mode ) {
  // warn user of possible loss of data
  window.onbeforeunload = function (e) {
    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = 'Did you save your data?';
    }

    // For Safari
    return 'Did you save your data?';
  };
}

//
// keep a record of image statistics (e.g. width, height, ...)
//
function img_stat_set(img_index, stat) {
  if ( stat.length ) {
    _via_img_stat[img_index] = stat;
  } else {
    delete _via_img_stat[img_index];
  }
}

function img_stat_set_all() {
  return new Promise( function(ok_callback, err_callback) {
    var promise_list = [];
    var img_id;
    for ( var img_index in _via_image_id_list ) {
      if ( ! _via_img_stat.hasOwnProperty(img_index) ) {
        img_id = _via_image_id_list[img_index];
        if ( _via_img_metadata[img_id].file_attributes.hasOwnProperty('width') &&
             _via_img_metadata[img_id].file_attributes.hasOwnProperty('height')
           ) {
          _via_img_stat[img_index] = [_via_img_metadata[img_id].file_attributes['width'],
                                      _via_img_metadata[img_id].file_attributes['height'],
                                     ];
        } else {
          promise_list.push( img_stat_get(img_index) );
        }
      }
    }
    if ( promise_list.length ) {
      Promise.all(promise_list).then( function(ok) {
        ok_callback();
      }.bind(this), function(err) {
        console.warn('Failed to read statistics of all images!');
        err_callback();
      });
    } else {
      ok_callback();
    }
  }.bind(this));
}

function img_stat_get(img_index) {
  return new Promise( function(ok_callback, err_callback) {
    var img_id = _via_image_id_list[img_index];
    var tmp_img = document.createElement('img');
    var tmp_file_object_url = null;
    tmp_img.addEventListener('load', function() {
      _via_img_stat[img_index] = [tmp_img.naturalWidth, tmp_img.naturalHeight];
      if ( tmp_file_object_url !== null ) {
        URL.revokeObjectURL(tmp_file_object_url);
      }
      ok_callback();
    }.bind(this));
    tmp_img.addEventListener('error', function() {
      _via_img_stat[img_index] = [-1, -1];
      if ( tmp_file_object_url !== null ) {
        URL.revokeObjectURL(tmp_file_object_url);
      }
      ok_callback();
    }.bind(this));

    if ( _via_img_fileref[img_id] instanceof File ) {
      tmp_file_object_url = URL.createObjectURL(_via_img_fileref[img_id]);
      tmp_img.src = tmp_file_object_url;
    } else {
      tmp_img.src = _via_img_src[img_id];
    }
  }.bind(this));
}


// pts = [x0,y0,x1,y1,....]
function polygon_to_bbox(pts) {
  var xmin = +Infinity;
  var xmax = -Infinity;
  var ymin = +Infinity;
  var ymax = -Infinity;
  for ( var i = 0; i < pts.length; i = i + 2 ) {
    if ( pts[i] > xmax ) {
      xmax = pts[i];
    }
    if ( pts[i] < xmin ) {
      xmin = pts[i];
    }
    if ( pts[i+1] > ymax ) {
      ymax = pts[i+1];
    }
    if ( pts[i+1] < ymin ) {
      ymin = pts[i+1];
    }
  }
  return [xmin, ymin, xmax-xmin, ymax-ymin];
}

