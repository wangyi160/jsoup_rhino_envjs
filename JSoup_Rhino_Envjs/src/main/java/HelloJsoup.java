import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class HelloJsoup {

	public static void main(String[] args) throws IOException
	{
		String html = "<html><head><title>First parse</title></head>"
				  + "<body><p>Parsed HTML into a doc.</p></body></html>";
		
		//Document doc=Jsoup.parse(html);
		
		Document doc = Jsoup.connect("https://www.baidu.com").get();
				
		Element body = doc.body();
		System.out.println(body.html());
		
		Elements elems = doc.getElementsByTag("script");
		
		Context rhino = Context.enter();
		Scriptable scope = rhino.initStandardObjects();
		
		MyJavaObject myobj=new MyJavaObject();
		ScriptableObject.putProperty(scope, "myobj", myobj);
		
		String envjs=HelloEnvjs.readEnvjs();
		Object result = rhino.evaluateString(scope, envjs, null, 1, null);
		
		for(int i=0;i<elems.size();i++)
		{
			Element scriptElem=elems.get(i);
			//System.out.println(scriptElem);
			
			String scriptStr=scriptElem.html();
			System.out.println(scriptStr);
			
			result = rhino.evaluateString(scope, scriptStr, null, 1, null);
			System.out.println("result:"+result);
		}
		
		
		
		
	}
	
}
