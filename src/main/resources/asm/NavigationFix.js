var asmapi = Java.type('net.neoforged.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')

function initializeCoreMod() {
    return {
    	'NavigationFix': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.world.entity.ai.navigation.PathNavigation'
    		},
    		'transformer': function(classNode) {
    			var count = 0
				var fn = "followThePath"
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
						patch_followTP(obj)
						count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify PathNavigation: Method not found")
    			return classNode;
    		}
    	}
    }
}

// [Forge change causing NW drift for bees] replace F2D
function patch_followTP(obj) {
	var count = 0
	var count2 = 0
	var node = asmapi.findFirstInstruction(obj, opc.INVOKEVIRTUAL)
	while (node) {
		if (node.owner == 'net/minecraft/core/Vec3i') {
			var node2 = node.getNext().getNext()
			var code2 = node2.getOpcode()
			if (code2 == opc.LDC) {
				count2++
			}
			else if (code2 == opc.ALOAD) {
				node2 = node2.getNext().getNext().getNext()
				code2 = node2.getOpcode()
				if (code2 == opc.FCONST_1) {
					node2 = node2.getNext().getNext()
					code2 = node2.getOpcode()
					if (code2 == opc.F2D) {
						var op1 = new InsnNode(opc.F2I)
						var op2 = new InsnNode(opc.I2D)
						var list = asmapi.listOf(op1, op2)
						obj.instructions.insertBefore(node2, list)
						obj.instructions.remove(node2)
						count++
					}
					else if (code2 == opc.F2I) {
						count2++
					}
				}
			}
		}
		var index = obj.instructions.indexOf(node)
		node = asmapi.findFirstInstructionAfter(obj, opc.INVOKEVIRTUAL, index + 1)
	}
	if (count + count2 < 2)
		asmapi.log("ERROR", "PathNavigation: not all fixes were done")
	else if (count > 2)
		asmapi.log("ERROR", "PathNavigation: too many fixes were added")
}
