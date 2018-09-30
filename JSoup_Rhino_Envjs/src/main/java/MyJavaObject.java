import java.util.Scanner;

import org.mozilla.javascript.ScriptableObject;

public class MyJavaObject {

	public void println(String str)
	{
		System.out.println("ahdflhajdhfj   "+str);
	}
	
	public String prompt(String message, String defaultMsg)
	{
		System.out.println(message+"\n"+defaultMsg+"?");
		
		Scanner scanner=new Scanner(System.in);
		String line=scanner.nextLine();
		
		if(line.isEmpty())
			return defaultMsg;
		else
			return line;
	}
	
	public boolean confirm(String question)
	{
		System.out.println(question);
		
		Scanner scanner=new Scanner(System.in);
		String line=scanner.nextLine();
		
		if(line.equalsIgnoreCase("y"))
			return true;
		else
			return false;
		
	}
	
}
