// VIA Mask Annotation Module
// Provides brush-based image mask annotation with color palette support.

// ============================================================
// Initialization
// ============================================================

function mask_init() {
  _via_mask_canvas = document.getElementById('mask_canvas');
  if (!_via_mask_canvas) {
    console.error('mask_init: #mask_canvas not found');
    return;
  }
  _via_mask_ctx = _via_mask_canvas.getContext('2d');

  // Sync UI elements
  var opacity_slider = document.getElementById('mask_opacity_slider');
  if (opacity_slider) {
    opacity_slider.value = Math.round(_via_mask_opacity * 100);
  }
  mask_sync_rgb_ui();
  mask_update_brush_size_label();
  mask_palette_render();

  // Set mask_canvas style so it sits on top of image but below reg_canvas
  _via_mask_canvas.style.opacity = _via_mask_opacity;
}

// ============================================================
// Mode Toggle
// ============================================================

function mask_mode_toggle() {
  _via_mask_mode = !_via_mask_mode;
  var indicator = document.getElementById('via_mode_indicator');
  var controls  = document.getElementById('mask_controls');

  if (_via_mask_mode) {
    if (indicator) indicator.textContent = '🖌 Mask Annotation';
    if (controls)  controls.style.display = 'flex';
    _via_reg_canvas.style.cursor = 'none';
    if (_via_current_image_loaded) {
      mask_resize_canvas();
      mask_restore_for_image(_via_image_id);
    }
  } else {
    if (indicator) indicator.textContent = '📷 Region Annotation';
    if (controls)  controls.style.display = 'none';
    _via_reg_canvas.style.cursor = 'crosshair';
    // Clear brush cursor
    _via_redraw_reg_canvas();
  }
}

// ============================================================
// Canvas Sizing
// ============================================================

function mask_resize_canvas() {
  if (!_via_mask_canvas || !_via_reg_canvas) return;
  _via_mask_canvas.width  = _via_reg_canvas.width;
  _via_mask_canvas.height = _via_reg_canvas.height;
  // Re-render mask for current image after resize
  if (_via_image_id && _via_mask_data[_via_image_id]) {
    mask_render_imagedata(_via_mask_data[_via_image_id]);
  }
}

// ============================================================
// Load / Save Mask Files
// ============================================================

function sel_local_mask_files() {
  if (_via_mask_fsa_supported && typeof showDirectoryPicker !== 'undefined') {
    showDirectoryPicker({ mode: 'readwrite' }).then(function(dirHandle) {
      _via_mask_dir_handle = dirHandle;
      return mask_files_load_from_dir(dirHandle);
    }).catch(function(err) {
      if (err.name !== 'AbortError') {
        console.error('sel_local_mask_files dir error:', err);
      }
    });
  } else {
    // Fallback: use hidden file input
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/png';
    inp.multiple = true;
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function() {
      mask_files_load_from_filelist(inp.files);
      document.body.removeChild(inp);
    });
    inp.click();
  }
}

async function mask_files_load_from_dir(dirHandle) {
  var count = 0;
  for await (var entry of dirHandle.values()) {
    if (entry.kind !== 'file') continue;
    if (!entry.name.toLowerCase().endsWith('.png')) continue;
    var fileHandle = await dirHandle.getFileHandle(entry.name);
    var file = await fileHandle.getFile();
    await mask_load_one_file(file, fileHandle);
    count++;
  }
  show_message('Loaded ' + count + ' mask file(s) from folder.');
  if (_via_current_image_loaded && _via_mask_mode) {
    mask_restore_for_image(_via_image_id);
  }
}

function mask_files_load_from_filelist(files) {
  var promises = [];
  for (var i = 0; i < files.length; i++) {
    promises.push(mask_load_one_file(files[i], null));
  }
  Promise.all(promises).then(function() {
    show_message('Loaded ' + files.length + ' mask file(s).');
    if (_via_current_image_loaded && _via_mask_mode) {
      mask_restore_for_image(_via_image_id);
    }
  }).catch(function(err) {
    console.error('mask_files_load_from_filelist error:', err);
    show_message('Error loading mask files.');
  });
}

function mask_load_one_file(file, handle) {
  return new Promise(function(resolve, reject) {
    var basename = file.name.replace(/\.[^.]+$/, ''); // strip extension

    // Find matching img_id: compare basename to image filename (with extension stripped)
    var matched_img_id = null;
    for (var i = 0; i < _via_image_id_list.length; i++) {
      var iid = _via_image_id_list[i];
      var img_filename = _via_img_metadata[iid].filename;
      var img_basename = img_filename.replace(/\.[^.]+$/, '');
      // Also check: mask might be named "imgname_mask" -> strip trailing _mask
      var clean_basename = basename.replace(/_mask$/, '');
      if (img_basename === basename || img_basename === clean_basename) {
        matched_img_id = iid;
        break;
      }
    }

    if (!matched_img_id) {
      console.warn('mask_load_one_file: no matching image for mask file "' + file.name + '"');
      resolve();
      return;
    }

    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function() {
      var oc = document.createElement('canvas');
      oc.width  = img.naturalWidth;
      oc.height = img.naturalHeight;
      var octx = oc.getContext('2d');
      octx.drawImage(img, 0, 0);
      var imageData = octx.getImageData(0, 0, oc.width, oc.height);
      _via_mask_data[matched_img_id] = imageData;
      if (handle) {
        _via_mask_filehandle[matched_img_id] = handle;
      }
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = function() {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load mask image: ' + file.name));
    };
    img.src = url;
  });
}

// ============================================================
// Restore / Display Mask for Current Image
// ============================================================

function mask_restore_for_image(img_id) {
  if (!_via_mask_canvas || !_via_mask_ctx) return;
  mask_resize_canvas();
  _via_mask_ctx.clearRect(0, 0, _via_mask_canvas.width, _via_mask_canvas.height);

  if (img_id && _via_mask_data[img_id]) {
    mask_render_imagedata(_via_mask_data[img_id]);
  }
  mask_palette_render();
}

function mask_render_imagedata(imageData) {
  if (!imageData || !_via_mask_ctx) return;
  // imageData is at original image dimensions; we need to draw it scaled to canvas size
  var oc = document.createElement('canvas');
  oc.width  = imageData.width;
  oc.height = imageData.height;
  var octx = oc.getContext('2d');
  octx.putImageData(imageData, 0, 0);

  var margin = _via_reg_canvas_margin;
  _via_mask_ctx.drawImage(
    oc,
    0, 0, imageData.width, imageData.height,
    margin, margin, _via_canvas_width, _via_canvas_height
  );
}

// ============================================================
// Auto-save on Image Switch
// ============================================================

function mask_save_current() {
  if (!_via_image_id || !_via_mask_ctx) return;
  // Capture current visible mask area (image area, not margin) as ImageData at original dims
  mask_capture_and_store(_via_image_id);
}

function mask_autosave_current(img_id) {
  // Called on image switch: capture then write to disk silently (no messages, no download)
  if (!img_id || !_via_mask_ctx) return;
  mask_capture_and_store(img_id);
  if (!_via_mask_data[img_id]) return;
  if (_via_mask_fsa_supported && _via_mask_dir_handle) {
    mask_write_to_dir(img_id, _via_mask_dir_handle).catch(function(err) {
      console.warn('mask_autosave dir write error:', err);
    });
  } else if (_via_mask_fsa_supported && _via_mask_filehandle[img_id]) {
    mask_write_to_filehandle(img_id).catch(function(err) {
      console.warn('mask_autosave write error:', err);
    });
  }
  // No fallback download on auto-save — silently skip if no handle available
}

function mask_capture_and_store(img_id) {
  if (!_via_mask_ctx || !_via_mask_canvas) return;
  var margin = _via_reg_canvas_margin;
  var w = _via_canvas_width;
  var h = _via_canvas_height;
  if (w <= 0 || h <= 0) return;

  var pixelData = _via_mask_ctx.getImageData(margin, margin, w, h);

  // Scale up to original image dimensions
  var natW = _via_current_image ? _via_current_image.naturalWidth  : w;
  var natH = _via_current_image ? _via_current_image.naturalHeight : h;

  var oc = document.createElement('canvas');
  oc.width  = natW;
  oc.height = natH;
  var octx = oc.getContext('2d');
  // Put the canvas-scale data into a temp canvas first
  var tc = document.createElement('canvas');
  tc.width  = w;
  tc.height = h;
  var tctx = tc.getContext('2d');
  tctx.putImageData(pixelData, 0, 0);
  octx.drawImage(tc, 0, 0, natW, natH);
  var storedImageData = octx.getImageData(0, 0, natW, natH);
  _via_mask_data[img_id] = storedImageData;
}

// ============================================================
// Explicit Save (button)
// ============================================================

function mask_save_current_explicit() {
  if (!_via_current_image_loaded) {
    show_message('No image loaded.');
    return;
  }
  mask_capture_and_store(_via_image_id);
  var img_id = _via_image_id;

  if (_via_mask_fsa_supported && _via_mask_dir_handle) {
    // Directory set → write silently by filename
    mask_write_to_dir(img_id, _via_mask_dir_handle).then(function() {
      show_message('Mask saved.');
    }).catch(function(err) {
      console.error('mask_save_current_explicit dir write error:', err);
      show_message('Error saving mask.');
    });
  } else if (_via_mask_fsa_supported && _via_mask_filehandle[img_id]) {
    // Loaded via Add Masks → overwrite in-place silently
    mask_write_to_filehandle(img_id).then(function() {
      show_message('Mask saved (overwrite).');
    }).catch(function(err) {
      console.error('mask_save_current_explicit write error:', err);
      show_message('Error saving mask.');
    });
  } else {
    // Fallback: download
    mask_download(img_id);
  }
}

function mask_save_all() {
  var ids = Object.keys(_via_mask_data);
  if (ids.length === 0) {
    show_message('No mask data to save.');
    return;
  }
  var promises = ids.map(function(img_id) {
    if (_via_mask_fsa_supported && _via_mask_dir_handle) {
      return mask_write_to_dir(img_id, _via_mask_dir_handle);
    } else if (_via_mask_fsa_supported && _via_mask_filehandle[img_id]) {
      return mask_write_to_filehandle(img_id);
    } else {
      mask_download(img_id);
      return Promise.resolve();
    }
  });
  Promise.all(promises).then(function() {
    show_message('All masks saved (' + ids.length + ' files).');
  });
}

function mask_write_to_dir(img_id, dirHandle) {
  var imageData = _via_mask_data[img_id];
  if (!imageData) return Promise.resolve();
  var img_filename = _via_img_metadata[img_id] ? _via_img_metadata[img_id].filename : 'mask';
  var basename = img_filename.replace(/\.[^.]+$/, '');
  var outname = basename + '.png';

  return new Promise(function(resolve, reject) {
    var oc = document.createElement('canvas');
    oc.width  = imageData.width;
    oc.height = imageData.height;
    var octx = oc.getContext('2d');
    octx.putImageData(imageData, 0, 0);
    oc.toBlob(function(blob) {
      if (!blob) { reject(new Error('toBlob failed')); return; }
      dirHandle.getFileHandle(outname, { create: true }).then(function(fileHandle) {
        // Store handle for future in-place overwrites
        _via_mask_filehandle[img_id] = fileHandle;
        fileHandle.createWritable().then(function(writable) {
          writable.write(blob).then(function() {
            writable.close().then(resolve).catch(reject);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    }, 'image/png');
  });
}

function mask_write_to_filehandle(img_id) {
  var imageData = _via_mask_data[img_id];
  if (!imageData) return Promise.resolve();
  var handle = _via_mask_filehandle[img_id];
  if (!handle) return Promise.reject(new Error('No file handle for ' + img_id));

  return new Promise(function(resolve, reject) {
    var oc = document.createElement('canvas');
    oc.width  = imageData.width;
    oc.height = imageData.height;
    var octx = oc.getContext('2d');
    octx.putImageData(imageData, 0, 0);
    oc.toBlob(function(blob) {
      if (!blob) { reject(new Error('toBlob failed')); return; }
      handle.createWritable().then(function(writable) {
        writable.write(blob).then(function() {
          writable.close().then(resolve).catch(reject);
        }).catch(reject);
      }).catch(reject);
    }, 'image/png');
  });
}

function mask_download(img_id) {
  var imageData = _via_mask_data[img_id];
  if (!imageData) return;

  var oc = document.createElement('canvas');
  oc.width  = imageData.width;
  oc.height = imageData.height;
  var octx = oc.getContext('2d');
  octx.putImageData(imageData, 0, 0);

  var img_filename = _via_img_metadata[img_id] ? _via_img_metadata[img_id].filename : 'mask';
  var basename = img_filename.replace(/\.[^.]+$/, '');
  var a = document.createElement('a');
  a.href = oc.toDataURL('image/png');
  a.download = basename + '.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
// Clear Mask
// ============================================================

function mask_clear_current() {
  if (!_via_current_image_loaded) return;
  if (!confirm('Clear the mask for this image?')) return;
  if (_via_mask_ctx) {
    _via_mask_ctx.clearRect(0, 0, _via_mask_canvas.width, _via_mask_canvas.height);
  }
  delete _via_mask_data[_via_image_id];
}

// ============================================================
// Mouse Events (called from via_canvas.js handlers)
// ============================================================

function mask_canvas_mousedown(e) {
  _via_mask_is_painting = true;
  var x = e.offsetX;
  var y = e.offsetY;
  _via_mask_prev_x = x;
  _via_mask_prev_y = y;
  mask_paint_at(x, y);
  e.preventDefault();
  e.stopPropagation();
}

function mask_canvas_mousemove(e) {
  var x = e.offsetX;
  var y = e.offsetY;

  if (_via_mask_is_painting) {
    // Interpolate between previous and current position for smooth strokes
    var dx = x - _via_mask_prev_x;
    var dy = y - _via_mask_prev_y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(1, Math.ceil(dist / (_via_mask_brush_size * 0.5)));
    for (var i = 1; i <= steps; i++) {
      var px = _via_mask_prev_x + dx * (i / steps);
      var py = _via_mask_prev_y + dy * (i / steps);
      mask_paint_at(px, py);
    }
    _via_mask_prev_x = x;
    _via_mask_prev_y = y;
  }

  // Track hover position for brush cursor redraws triggered outside mousemove
  _via_mask_cursor_x = x;
  _via_mask_cursor_y = y;
  // Draw brush cursor on reg_canvas
  mask_draw_brush_cursor(x, y);
  e.preventDefault();
}

function mask_canvas_mouseup(e) {
  _via_mask_is_painting = false;
  _via_mask_prev_x = -1;
  _via_mask_prev_y = -1;
  e.preventDefault();
  e.stopPropagation();
}

function mask_canvas_mouseleave(e) {
  _via_mask_is_painting = false;
  _via_mask_prev_x = -1;
  _via_mask_prev_y = -1;
  _via_mask_cursor_x = -1;
  _via_mask_cursor_y = -1;
  // Clear brush cursor
  _via_redraw_reg_canvas();
}

// ============================================================
// Painting
// ============================================================

function mask_paint_at(x, y) {
  if (!_via_mask_ctx) return;
  _via_mask_ctx.beginPath();
  _via_mask_ctx.arc(x, y, _via_mask_brush_size, 0, 2 * Math.PI);
  _via_mask_ctx.fillStyle = 'rgba(' + _via_mask_brush_r + ',' + _via_mask_brush_g + ',' + _via_mask_brush_b + ',' + (_via_mask_brush_a / 255) + ')';
  _via_mask_ctx.fill();
}

function mask_draw_brush_cursor(x, y) {
  _via_redraw_reg_canvas();
  if (!_via_reg_ctx) return;
  _via_reg_ctx.save();
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(x, y, _via_mask_brush_size, 0, 2 * Math.PI);
  _via_reg_ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  _via_reg_ctx.lineWidth = 1.5;
  _via_reg_ctx.stroke();
  _via_reg_ctx.beginPath();
  _via_reg_ctx.arc(x, y, _via_mask_brush_size, 0, 2 * Math.PI);
  _via_reg_ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  _via_reg_ctx.lineWidth = 0.5;
  _via_reg_ctx.stroke();
  _via_reg_ctx.restore();
}

// ============================================================
// Brush Size
// ============================================================

function mask_brush_size_change(delta) {
  _via_mask_brush_size = Math.max(2, Math.min(200, _via_mask_brush_size + delta));
  mask_update_brush_size_label();
  // Immediately redraw cursor at last known position
  if (_via_mask_cursor_x >= 0 && _via_mask_cursor_y >= 0) {
    mask_draw_brush_cursor(_via_mask_cursor_x, _via_mask_cursor_y);
  }
}

function mask_update_brush_size_label() {
  var el = document.getElementById('mask_brush_size_label');
  if (el) el.textContent = _via_mask_brush_size + 'px';
}

// ============================================================
// Opacity
// ============================================================

function mask_update_opacity() {
  var slider = document.getElementById('mask_opacity_slider');
  if (!slider) return;
  _via_mask_opacity = slider.value / 100;
  if (_via_mask_canvas) {
    _via_mask_canvas.style.opacity = _via_mask_opacity;
  }
  var val_el = document.getElementById('mask_opacity_value');
  if (val_el) val_el.textContent = Math.round(_via_mask_opacity * 100) + '%';
}

// ============================================================
// RGB Brush Color
// ============================================================

function mask_sync_rgb_ui() {
  var rs = document.getElementById('mask_r_slider');
  var gs = document.getElementById('mask_g_slider');
  var bs = document.getElementById('mask_b_slider');
  var rn = document.getElementById('mask_r_num');
  var gn = document.getElementById('mask_g_num');
  var bn = document.getElementById('mask_b_num');
  if (rs) rs.value = _via_mask_brush_r;
  if (gs) gs.value = _via_mask_brush_g;
  if (bs) bs.value = _via_mask_brush_b;
  if (rn) rn.value = _via_mask_brush_r;
  if (gn) gn.value = _via_mask_brush_g;
  if (bn) bn.value = _via_mask_brush_b;
  mask_update_brush_preview();
}

function mask_update_brush_r(v) {
  _via_mask_brush_r = Math.max(0, Math.min(255, parseInt(v) || 0));
  mask_sync_rgb_ui();
}

function mask_update_brush_g(v) {
  _via_mask_brush_g = Math.max(0, Math.min(255, parseInt(v) || 0));
  mask_sync_rgb_ui();
}

function mask_update_brush_b(v) {
  _via_mask_brush_b = Math.max(0, Math.min(255, parseInt(v) || 0));
  mask_sync_rgb_ui();
}

function mask_update_brush_preview() {
  var el = document.getElementById('mask_brush_preview');
  if (el) {
    el.style.background = 'rgb(' + _via_mask_brush_r + ',' + _via_mask_brush_g + ',' + _via_mask_brush_b + ')';
  }
}

// ============================================================
// Color Palette
// ============================================================

function mask_palette_render() {
  var container = document.getElementById('mask_palette_swatches');
  if (!container) return;
  container.innerHTML = '';

  for (var i = 0; i < _via_mask_palette.length; i++) {
    var c = _via_mask_palette[i];
    var swatch = document.createElement('span');
    swatch.className = 'mask_palette_swatch' + (i === _via_mask_palette_active_index ? ' active' : '');
    swatch.style.background = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
    swatch.title = (i === 0 ? 'Black (background/erase)' : 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')');
    (function(idx) {
      swatch.addEventListener('click', function() { mask_palette_select(idx); });
    })(i);
    container.appendChild(swatch);
  }
}

function mask_palette_select(index) {
  if (index < 0 || index >= _via_mask_palette.length) return;
  _via_mask_palette_active_index = index;
  var c = _via_mask_palette[index];
  _via_mask_brush_r = c.r;
  _via_mask_brush_g = c.g;
  _via_mask_brush_b = c.b;
  mask_sync_rgb_ui();
  mask_palette_render();
}

function mask_palette_add_current() {
  var r = _via_mask_brush_r;
  var g = _via_mask_brush_g;
  var b = _via_mask_brush_b;
  // Check for duplicates
  for (var i = 0; i < _via_mask_palette.length; i++) {
    if (_via_mask_palette[i].r === r && _via_mask_palette[i].g === g && _via_mask_palette[i].b === b) {
      mask_palette_select(i);
      return;
    }
  }
  _via_mask_palette.push({ r: r, g: g, b: b });
  _via_mask_palette_active_index = _via_mask_palette.length - 1;
  mask_palette_render();
}
