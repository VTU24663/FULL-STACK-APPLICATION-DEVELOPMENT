import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class EmployeeService {

    // 🔥 In-memory storage
    private List<Employee> employees = new ArrayList<>();

    @Autowired
    private Employee emp;

    public void addEmployee(int id, String name) {
        Employee e = new Employee(id, name);
        employees.add(e);
    }

    public void displayEmployees() {
        for (Employee e : employees) {
            System.out.println("ID: " + e.getId() + ", Name: " + e.getName());
        }
    }
}