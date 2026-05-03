/*  Copyright (c) 2016-2019, Abhishek Dutta, Visual Geometry Group, Oxford University and VIA Contributors.  All rights reserved.  
REDISTRIBUTION and use in source and binary forms, with or without  modification, are permitted provided that the following conditions are met:  
REDISTRIBUTIONs of source code must retain the above copyright notice, this  list of conditions and the following disclaimer.  
REDISTRIBUTIONs in binary form must reproduce the above copyright notice,  this list of conditions and the following disclaimer in the documentation  and/or other materials provided with the distribution.  
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)  ARISING IN ANY WAY OUT OF THE USE OF 
THIS SOFTWARE, EVEN IF ADVISED OF THE  POSSIBILITY OF SUCH DAMAGE.*//*  Links:  - https://gitlab.com/vgg/via/blob/master/Contributors.md : list of developers who have contributed code to the VIA project.  - https://gitlab.com/vgg/via/blob/master/CodeDoc.md : source code documentation  - https://gitlab.com/vgg/via/blob/master/CONTRIBUTING.md : guide for contributors  This source code can be grouped into the following categories:  - Data structure for annotations  - Initialization routine  - Handlers for top navigation bar  - Local file uploaders  - Data Importer  - Data Exporter  - Maintainers of user interface  - Image click handlers  - Canvas update routines  - Region collision routines  - Shortcut key handlers  - Persistence of annotation data in browser cache (i.e. localStorage)  - Handlers for attributes input panel (spreadsheet like user input panel)*/"use strict";
var VIA_VERSION      = '2.0.10';
var VIA_NAME         = 'VGG Image Annotator';
var VIA_SHORT_NAME   = 'VIA';
var VIA_REGION_SHAPE = { RECT:'rect',                         CIRCLE:'circle',                         ELLIPSE:'ellipse',                         POLYGON:'polygon',                         POINT:'point',                         POLYLINE:'polyline'                       };
var VIA_ATTRIBUTE_TYPE = { TEXT:'text',                           CHECKBOX:'checkbox',                           RADIO:'radio',                           IMAGE:'image',                           DROPDOWN:'dropdown'                         };
var VIA_DISPLAY_AREA_CONTENT_NAME = {IMAGE:'image_panel',                                     IMAGE_GRID:'image_grid_panel',                                     SETTINGS:'settings_panel',                                     PAGE_404:'page_404',                                     PAGE_GETTING_STARTED:'page_getting_started',                                     PAGE_ABOUT:'page_about',                                     PAGE_START_INFO:'page_start_info',                                     PAGE_LICENSE:'page_license'                                    };
var VIA_ANNOTATION_EDITOR_MODE    = {SINGLE_REGION:'single_region',                                     ALL_REGIONS:'all_regions'};
var VIA_ANNOTATION_EDITOR_PLACEMENT = {NEAR_REGION:'NEAR_REGION',                                       IMAGE_BOTTOM:'IMAGE_BOTTOM',                                       DISABLE:'DISABLE'};
var VIA_REGION_EDGE_TOL           = 5;   // pixel
var VIA_REGION_CONTROL_POINT_SIZE = 2;
var VIA_REGION_OUTSIDE_IMAGE_MARGIN = 256;
var VIA_POLYGON_VERTEX_MATCH_TOL  = 5;
var VIA_REGION_MIN_DIM            = 0;
var VIA_MOUSE_CLICK_TOL           = 2;
var VIA_POLYGON_MOUSE_CLICK_TOL   = 8;
var VIA_ELLIPSE_EDGE_TOL          = 0.2; // euclidean distance
var VIA_THETA_TOL                 = Math.PI/18; // 10 degrees
var VIA_POLYGON_RESIZE_VERTEX_OFFSET  = 100;
var VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX = 3;
var VIA_CANVAS_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 4, 5, 6, 7, 8, 9, 10];
var VIA_REGION_COLOR_LIST = ["#E69F00", "#56B4E9", "#009E73", "#D55E00", "#CC79A7", "#F0E442", "#ffffff"];// radius of control points in all shapes
var VIA_REGION_SHAPES_POINTS_RADIUS = 3;// radius of control points in a point
var VIA_REGION_POINT_RADIUS         = 3;
var VIA_REGION_POINT_RADIUS_DEFAULT = 3;
var VIA_THEME_REGION_BOUNDARY_WIDTH = 3;
var VIA_THEME_BOUNDARY_LINE_COLOR   = "black";
var VIA_THEME_BOUNDARY_FILL_COLOR   = "yellow";
var VIA_THEME_SEL_REGION_FILL_COLOR = "#808080";
var VIA_THEME_SEL_REGION_FILL_BOUNDARY_COLOR = "yellow";
var VIA_THEME_POLYGON_BOUNDARY_COLOR = "#7c3aed";
var VIA_THEME_POLYGON_FILL_COLOR = "#7c3aed";
var VIA_THEME_POLYGON_FILL_OPACITY = 0.18;
var VIA_THEME_POLYGON_LINE_WIDTH = 3;
var VIA_THEME_POLYGON_VERTEX_RADIUS = 3;
var VIA_THEME_POLYGON_CURSOR_RADIUS = 3;
var VIA_THEME_SEL_REGION_OPACITY    = 0.5;
var VIA_THEME_MESSAGE_TIMEOUT_MS    = 6000;
var VIA_THEME_CONTROL_POINT_COLOR   = '#ff0000';
var VIA_CLICK_DEBUG_LOG             = true;
var VIA_CSV_SEP        = ',';
var VIA_CSV_QUOTE_CHAR = '"';
var VIA_CSV_KEYVAL_SEP = ':';
var _via_img_metadata = {};   // data structure to store loaded images metadata
var _via_img_src      = {};   // image content {abs. path, url, base64 data, etc}
var _via_img_fileref  = {};   // reference to local images selected by using browser file selector
var _via_img_count    = 0;    // count of the loaded images
var _via_canvas_regions = []; // image regions spec. in canvas space
var _via_canvas_scale   = 1.0;// current scale of canvas image
var _via_image_id       = ''; // id={filename+length} of current image
var _via_image_index    = -1; // index
var _via_current_image_filename;
var _via_current_image;
var _via_current_image_width;
var _via_current_image_height;// a record of image statistics (e.g. width, height)
var _via_img_stat     = {};
var _via_is_all_img_stat_read_ongoing = false;
var _via_img_stat_current_img_index = false;// image canvas
var _via_display_area = document.getElementById('display_area');
var _via_img_panel    = document.getElementById('image_panel');
var _via_reg_canvas   = document.getElementById('region_canvas');
var _via_reg_ctx; // initialized in _via_init()
var _via_canvas_width, _via_canvas_height;// canvas zoom
var _via_canvas_zoom_level_index   = VIA_CANVAS_DEFAULT_ZOOM_LEVEL_INDEX; // 1.0

var _via_canvas_scale_without_zoom = 1.0;// state of the application
var _via_is_user_drawing_region  = false;
var _via_current_image_loaded    = false;
var _via_is_window_resized       = false;
var _via_is_user_resizing_region = false;
var _via_is_user_moving_region   = false;
var _via_is_user_drawing_polygon = false;
var _via_is_region_selected      = false;
var _via_is_all_region_selected  = false;
var _via_is_loaded_img_list_visible  = false;
var _via_is_attributes_panel_visible = false;
var _via_is_reg_attr_panel_visible   = false;
var _via_is_file_attr_panel_visible  = false;
var _via_is_canvas_zoomed            = false;
var _via_is_loading_current_image    = false;
var _via_is_region_id_visible        = true;
var _via_is_region_boundary_visible  = true;
var _via_is_region_info_visible      = false;
var _via_is_ctrl_pressed             = false;
var _via_is_debug_mode               = false;// region
var _via_current_shape             = VIA_REGION_SHAPE.RECT;
var _via_current_polygon_region_id = -1;
var _via_user_sel_region_id        = -1;
var _via_click_x0 = 0; 
var _via_click_y0 = 0;
var _via_click_x1 = 0; 
var _via_click_y1 = 0;
var _via_region_click_x, _via_region_click_y;
var _via_region_edge          = [-1, -1];
var _via_current_x = 0; 
var _via_current_y = 0;
var _via_reg_canvas_margin = VIA_REGION_OUTSIDE_IMAGE_MARGIN;// region copy/paste
var _via_region_selected_flag = []; // region select flag for current image
var _via_copied_image_regions = [];
var _via_paste_to_multiple_images_input;// message
var _via_message_clear_timer;// attributes
var _via_attribute_being_updated       = 'region'; // {region, file}
var _via_attributes                    = { 'region':{}, 'file':{} };
var _via_current_attribute_id          = '';// region group color
var _via_canvas_regions_group_color = {}; // color of each region// invoke a method after receiving user input
var _via_user_input_ok_handler     = null;
var _via_user_input_cancel_handler = null;
var _via_user_input_data           = {};// annotation editor
var _via_annotaion_editor_panel     = document.getElementById('annotation_editor_panel');
var _via_metadata_being_updated     = 'region'; // {region, file}
var _via_annotation_editor_mode     = VIA_ANNOTATION_EDITOR_MODE.SINGLE_REGION;// persistence to local storage
var _via_is_local_storage_available = false;
var _via_is_save_ongoing            = false;// all the image_id and image_filename of images added by the user is// stored in _via_image_id_list and _via_image_filename_list//// Image filename list (img_fn_list) contains a filtered list of images// currently accessible by the user. The img_fn_list is visible in the// left side toolbar. image_grid, next/prev, etc operations depend on// the contents of _via_img_fn_list_img_index_list.
var _via_image_id_list                 = []; // array of all image id (in order they were added by user)
var _via_image_filename_list           = []; // array of all image filename
var _via_image_load_error              = []; // {true, false}
var _via_image_filepath_resolved       = []; // {true, false}
var _via_image_filepath_id_list        = []; // path for each file
var _via_reload_img_fn_list_table      = true;
var _via_img_fn_list_img_index_list    = []; // image index list of images show in img_fn_list
var _via_img_fn_list_html              = []; // html representation of image filename list// image grid
var image_grid_panel                        = document.getElementById('image_grid_panel');
var _via_display_area_content_name          = ''; // describes what is currently shown in display area
var _via_display_area_content_name_prev     = '';
var _via_image_grid_requires_update         = false;
var _via_image_grid_content_overflow        = false;
var _via_image_grid_load_ongoing            = false;
var _via_image_grid_page_first_index        = 0; // array index in _via_img_fn_list_img_index_list[]
var _via_image_grid_page_last_index         = -1;
var _via_image_grid_selected_img_index_list = [];
var _via_image_grid_page_img_index_list     = []; // list of all image index in current page of image grid
var _via_image_grid_visible_img_index_list  = []; // list of images currently visible in grid
var _via_image_grid_mousedown_img_index     = -1;
var _via_image_grid_mouseup_img_index       = -1;
var _via_image_grid_img_index_list          = []; // list of all image index in the image grid
var _via_image_grid_region_index_list       = []; // list of all image index in the image grid
var _via_image_grid_group                   = {}; // {'value':[image_index_list]}
var _via_image_grid_group_var               = []; // {type, name, value}
var _via_image_grid_group_show_all          = false;
var _via_image_grid_stack_prev_page         = []; // stack of first img index of every page navigated so far// image buffer
var VIA_IMG_PRELOAD_INDICES         = [1, -1, 2, 3, -2, 4]; // for any image, preload previous 2 and next 4 images
var VIA_IMG_PRELOAD_COUNT           = 4;
var _via_buffer_preload_img_index   = -1;
var _via_buffer_img_index_list      = [];
var _via_buffer_img_shown_timestamp = [];
var _via_preload_img_promise_list   = [];// via settings
var _via_settings = {};_via_settings.ui  = {};_via_settings.ui.annotation_editor_height   = 25; /**/_via_settings.ui.annotation_editor_fontsize = 0.8;/**/_via_settings.ui.leftsidebar_width          = 18;  /**/_via_settings.ui.image_grid = {};_via_settings.ui.image_grid.img_height          = 80;  /**/_via_settings.ui.image_grid.rshape_fill         = 'none';_via_settings.ui.image_grid.rshape_fill_opacity = 0.3;_via_settings.ui.image_grid.rshape_stroke       = 'yellow';_via_settings.ui.image_grid.rshape_stroke_width = 2;_via_settings.ui.image_grid.show_region_shape   = true;_via_settings.ui.image_grid.show_image_policy   = 'all';_via_settings.ui.image = {};_via_settings.ui.image.region_label      = '__via_region_id__'; /**/_via_settings.ui.image.region_color      = '__via_default_region_color__'; /**/_via_settings.ui.image.region_label_font = '10px Sans';_via_settings.ui.image.on_image_annotation_editor_placement = VIA_ANNOTATION_EDITOR_PLACEMENT.NEAR_REGION;_via_settings.core                  = {};_via_settings.core.buffer_size      = 4*VIA_IMG_PRELOAD_COUNT + 2;_via_settings.core.filepath         = {};_via_settings.core.default_filepath = '';/**/
var invisible_file_input = document.getElementById("invisible_file_input");
var display_area    = document.getElementById("display_area");
var ui_top_panel    = document.getElementById("ui_top_panel");
var image_panel     = document.getElementById("image_panel");
var img_buffer_now  = document.getElementById("img_buffer_now");
var annotation_list_snippet = document.getElementById("annotation_list_snippet");
var annotation_textarea     = document.getElementById("annotation_textarea");
var img_fn_list_panel     = document.getElementById('img_fn_list_panel');
var img_fn_list           = document.getElementById('img_fn_list');

// ---- Mask Annotation Globals ----
var _via_mask_mode                  = false;
var _via_mask_data                  = {};    // img_id → ImageData (at original image dimensions)
var _via_mask_filehandle            = {};    // img_id → FileSystemFileHandle
var _via_mask_brush_size            = 20;
var _via_mask_brush_r               = 255;
var _via_mask_brush_g               = 0;
var _via_mask_brush_b               = 0;
var _via_mask_brush_a               = 255;
var _via_mask_opacity               = 0.5;
var _via_mask_is_painting           = false;
var _via_mask_ctx                   = null;
var _via_mask_canvas                = null;
var _via_mask_prev_x                = -1;
var _via_mask_prev_y                = -1;
var _via_mask_cursor_x              = -1;
var _via_mask_cursor_y              = -1;
var _via_mask_palette               = [{r:0,g:0,b:0},{r:255,g:255,b:255}]; // black, white
var _via_mask_palette_active_index  = 0;
var _via_mask_fsa_supported         = (typeof showOpenFilePicker !== 'undefined');
var _via_mask_dir_handle            = null; // FileSystemDirectoryHandle — set once, enables silent saves