var asmapi = Java.type('net.neoforged.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'TurtleEgg': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.world.level.block.TurtleEggBlock'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = "canDestroyEgg"
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_canDestroy(obj)
    					count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify TurtleEggBlock: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add instanceof Bee
function patch_canDestroy(obj) {
	var desc = "net/minecraft/world/entity/ambient/Bat"
	var node = asmapi.findFirstInstruction(obj, opc.INSTANCEOF)
	while (node) {
		if (node.desc == desc) {
			var node2 = node.getNext()
			var node3 = node2.getNext()
			if (node2.getOpcode() == opc.IFEQ && node3.getType() == AbstractInsnNode.LABEL) {
				var op1 = new JumpInsnNode(opc.IFNE, node3)
				var op2 = new VarInsnNode(opc.ALOAD, 2)
				var op3 = new TypeInsnNode(opc.INSTANCEOF, "net/minecraft/world/entity/animal/Bee")
				var list = asmapi.listOf(op1, op2, op3)
				obj.instructions.insert(node, list)
			}
			else
				asmapi.log("ERROR", "Failed to modify TurtleEggBlock: INSTANCEOF is different")
			return;
		}
		var index = obj.instructions.indexOf(node)
		node = asmapi.findFirstInstructionAfter(obj, opc.INSTANCEOF, index + 1)
	}
	asmapi.log("ERROR", "Failed to modify TurtleEggBlock: INSTANCEOF not found")
}
