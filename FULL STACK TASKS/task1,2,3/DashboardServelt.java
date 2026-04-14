import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class DashboardServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String sort = request.getParameter("sort");
        String dept = request.getParameter("dept");

        String query = "SELECT * FROM students";

        if (dept != null && !dept.equals("all")) {
            query += " WHERE department='" + dept + "'";
        }

        if (sort != null) {
            query += " ORDER BY " + sort;
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(query);

            PrintWriter out = response.getWriter();

            out.println("<html><body>");

            out.println("<form>");
            out.println("Filter Dept: <select name='dept'>");
            out.println("<option value='all'>All</option>");
            out.println("<option value='CSE'>CSE</option>");
            out.println("<option value='IT'>IT</option>");
            out.println("</select>");

            out.println("Sort By:");
            out.println("<select name='sort'>");
            out.println("<option value='name'>Name</option>");
            out.println("<option value='dob'>DOB</option>");
            out.println("</select>");

            out.println("<button type='submit'>Apply</button>");
            out.println("</form>");

            out.println("<table border='1'>");
            out.println("<tr><th>Name</th><th>Email</th><th>DOB</th><th>Dept</th></tr>");

            while (rs.next()) {
                out.println("<tr>");
                out.println("<td>" + rs.getString("name") + "</td>");
                out.println("<td>" + rs.getString("email") + "</td>");
                out.println("<td>" + rs.getString("dob") + "</td>");
                out.println("<td>" + rs.getString("department") + "</td>");
                out.println("</tr>");
            }

            out.println("</table>");

            ResultSet countRs = st.executeQuery(
                    "SELECT department, COUNT(*) as total FROM students GROUP BY department");

            out.println("<h3>Count per Department</h3>");
            while (countRs.next()) {
                out.println(countRs.getString("department") + ": " +
                        countRs.getInt("total") + "<br>");
            }

            out.println("</body></html>");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}