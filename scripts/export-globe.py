"""Bake the original Blender globe for the hero. Run with Blender -b SOURCE --python this-file."""
import bpy, os, math
from pathlib import Path
root = Path(__file__).resolve().parent.parent
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.device = 'CPU'
scene.render.bake.margin = 8
earth = bpy.data.objects['Earth Globe']
bpy.ops.object.select_all(action='DESELECT')
earth.select_set(True)
bpy.context.view_layer.objects.active = earth
# A dedicated bake UV layer captures the original Generated-coordinate shaders.
if not earth.data.uv_layers:
 bpy.ops.object.mode_set(mode='EDIT')
 bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(island_margin=0.02)
 bpy.ops.object.mode_set(mode='OBJECT')
mat = earth.active_material
nodes, links = mat.node_tree.nodes, mat.node_tree.links
bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
out = next(n for n in nodes if n.type == 'OUTPUT_MATERIAL')
color_source = bsdf.inputs['Base Color'].links[0].from_socket
strength_source = bsdf.inputs['Emission Strength'].links[0].from_socket
emission = nodes.new('ShaderNodeEmission')
target = nodes.new('ShaderNodeTexImage')
images = {}
for kind in ['color', 'emission', 'normal']:
 image = bpy.data.images.new('Globe Baked ' + kind, width=2048, height=2048, alpha=False)
 if kind == 'normal': image.colorspace_settings.name = 'Non-Color'
 target.image = image
 nodes.active = target
 if kind == 'normal':
  links.new(bsdf.outputs[0], out.inputs['Surface'])
  bpy.ops.object.bake(type='NORMAL')
 else:
  links.new(color_source, emission.inputs['Color'])
  if kind == 'emission':
   scale = nodes.new('ShaderNodeMath'); scale.operation = 'DIVIDE'; scale.inputs[1].default_value = 4
   links.new(strength_source, scale.inputs[0]); links.new(scale.outputs[0], emission.inputs['Strength'])
  else: emission.inputs['Strength'].default_value = 1
  links.new(emission.outputs[0], out.inputs['Surface'])
  bpy.ops.object.bake(type='EMIT')
 image.pack()
 images[kind] = image
# Replace procedural nodes only in this in-memory export copy.
nodes.clear()
bsdf = nodes.new('ShaderNodeBsdfPrincipled'); out = nodes.new('ShaderNodeOutputMaterial')
links.new(bsdf.outputs[0],out.inputs['Surface'])
bsdf.inputs['Metallic'].default_value = 0.2
bsdf.inputs['Roughness'].default_value = 0.32
bsdf.inputs['Alpha'].default_value = 0.84
bsdf.inputs['Emission Strength'].default_value = 4
mat.surface_render_method = 'DITHERED'
for kind, image in images.items():
 tex = nodes.new('ShaderNodeTexImage'); tex.image = image
 if kind == 'normal':
  normal = nodes.new('ShaderNodeNormalMap'); links.new(tex.outputs['Color'],normal.inputs['Color']); links.new(normal.outputs[0],bsdf.inputs['Normal'])
 else: links.new(tex.outputs['Color'],bsdf.inputs['Base Color' if kind == 'color' else 'Emission Color'])
for obj in scene.objects:
 if 'Halo' not in obj.name: continue
 m = obj.active_material
 n = m.node_tree.nodes
 obj['haloColor'] = list(n['Emission'].inputs['Color'].default_value)[:3]
 obj['haloStrength'] = n['Emission'].inputs['Strength'].default_value
 obj['haloBlend'] = n['Layer Weight'].inputs['Blend'].default_value
 obj['haloPower'] = n['Math'].inputs[1].default_value
 obj['haloOpacity'] = n['Math.001'].inputs[1].default_value
 print('HALO',obj.name,dict(obj.items()),flush=True)
 # Facing-dependent transparency is reconstructed from these extras on the web.
 n.clear(); p=n.new('ShaderNodeBsdfPrincipled'); o=n.new('ShaderNodeOutputMaterial')
 p.inputs['Base Color'].default_value = (0,0,0,1)
 p.inputs['Emission Color'].default_value = (*obj['haloColor'],1)
 p.inputs['Emission Strength'].default_value = obj['haloStrength']
 p.inputs['Alpha'].default_value = 0
 m.node_tree.links.new(p.outputs[0],o.inputs['Surface'])
 m.surface_render_method = 'DITHERED'
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
 if obj.type in {'MESH','CURVE'}: obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'public/models/Globe.glb'),export_format='GLB',use_selection=True,export_extras=True,export_animations=False)
print('GLOBE_EXPORT_COMPLETE', flush=True)
