var asmapi = Java.type('net.neoforged.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')
var LdcInsnNode = Java.type('org.objectweb.asm.tree.LdcInsnNode')
var MethodNode = Java.type('org.objectweb.asm.tree.MethodNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'BeeRenderer': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.client.renderer.entity.BeeRenderer'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var found = false
    			var fn = "getFlipDegrees"
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn && (obj.access & opc.ACC_SYNTHETIC) == 0) {
    					found = true
    				}
    			}
    			count++
    			if (!found) {
    				insert_getFD(classNode, fn)
    				insert_getFD_syn(classNode, fn)
    			}
    			else
    				asmapi.log("INFO", "BeeRenderer patch being skipped; not needed in this version")
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify BeeRenderer: Method not found")
    			return classNode;
    		}
    	}
    }
}

function insert_getFD(cobj, fn) {
	var desc = "(Lnet/minecraft/world/entity/animal/Bee;)F"
	var obj = new MethodNode(opc.ACC_PROTECTED, fn, desc, null, null)
	cobj.methods.add(obj)
	var op1 = new LdcInsnNode(180.0)
	var op2 = new InsnNode(opc.D2F)
	var op3 = new InsnNode(opc.FRETURN)
	var list = asmapi.listOf(op1, op2, op3)
	obj.instructions.add(list)
}

function insert_getFD_syn(cobj, fn) {
	var desc = "(Lnet/minecraft/world/entity/LivingEntity;)F"
	var obj = new MethodNode(opc.ACC_SYNTHETIC | opc.ACC_BRIDGE | opc.ACC_PROTECTED, fn, desc, null, null)
	cobj.methods.add(obj)
	var desc2 = "(Lnet/minecraft/world/entity/animal/Bee;)F"
	var op1 = new VarInsnNode(opc.ALOAD, 0)
	var op2 = new VarInsnNode(opc.ALOAD, 1)
	var op3 = new TypeInsnNode(opc.CHECKCAST, "net/minecraft/world/entity/animal/Bee")
	var op4 = asmapi.buildMethodCall("net/minecraft/client/renderer/entity/BeeRenderer", fn, desc2, asmapi.MethodType.VIRTUAL)
	var op5 = new InsnNode(opc.FRETURN)
	var list = asmapi.listOf(op1, op2, op3, op4, op5)
	obj.instructions.add(list)
}