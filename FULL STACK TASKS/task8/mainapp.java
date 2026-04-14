import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MainApp {

    public static void main(String[] args) {

        // 🔥 BeanFactory (IoC container)
        BeanFactory factory = new AnnotationConfigApplicationContext(AppConfig.class);

        EmployeeService service = factory.getBean(EmployeeService.class);

        // Add employees
        service.addEmployee(1, "Aparna");
        service.addEmployee(2, "Rahul");

        // Display
        service.displayEmployees();
    }
}