import java.util.Scanner;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class HelloRhino {

	public static void main(String args[])
	{
		Context rhino = Context.enter();
		
		MyJavaObject myobj=new MyJavaObject();
		
		Scriptable scope = rhino.initStandardObjects();
		ScriptableObject.putProperty(scope, "myobj", myobj);
		
		String string="myobj.print('adsfsdf');";
		
		Object result = rhino.evaluateString(scope, string, null, 1, null);
				
		System.out.println(result.getClass().getName());
		
		
	}
	
	
	
}
