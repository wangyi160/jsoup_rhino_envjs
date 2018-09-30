import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class HelloEnvjs {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

		Context rhino = Context.enter();
		
				
		Scriptable scope = rhino.initStandardObjects();
		
		MyJavaObject myobj=new MyJavaObject();
		ScriptableObject.putProperty(scope, "myobj", myobj);
		
		String string=readEnvjs();
		//System.out.println(string);
		
		Object result = rhino.evaluateString(scope, string, null, 1, null);
		result = rhino.evaluateString(scope, "window.alert('aaa');", null, 1, null);
		
				
		result = rhino.evaluateString(scope, "var a=window.prompt('aaa','bbb'); a;", null, 1, null);
		System.out.println(result);
		
		result = rhino.evaluateString(scope, "a;", null, 1, null);
		System.out.println(result);
		
	}
	
	public static String readEnvjs()
	{
		String encoding = "GBK";  
        File file = new File("env.rhino.js");  
        Long filelength = file.length();  
        byte[] filecontent = new byte[filelength.intValue()];  
        try {  
            FileInputStream in = new FileInputStream(file);  
            in.read(filecontent);  
            in.close();  
        } catch (FileNotFoundException e) {  
            e.printStackTrace();  
        } catch (IOException e) {  
            e.printStackTrace();  
        }  
        try {  
            return new String(filecontent, encoding);  
        } catch (UnsupportedEncodingException e) {  
            System.err.println("The OS does not support " + encoding);  
            e.printStackTrace();  
            return null;  
        }  
		
	}

}














